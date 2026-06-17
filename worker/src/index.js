import { Redis } from '@upstash/redis/cloudflare';

const corsHeaders = {
	'Access-Control-Allow-Origin': 'https://skbidi.xyz',
	'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

// ---- helpers ----

function randomHex(n) {
	return [...Array(n)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}

function randomBase64(n) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
	return [...Array(n)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// ---- themes ----

const themes = [
	function skibidiTheme(origin) {
		const slug = `skibidi-${randomHex(3)}`;
		const paths = [
			`/ohio/rizz?gyatt=${randomHex(4)}&fr=fr`,
			`/sigma/auth?aura=${randomInt(100, 999)}&rizz=max`,
			`/toilet/verify?bussin=${randomHex(4)}`,
			`/fanum/tax?mewing=${randomHex(4)}`,
		];
		return { slug, susUrl: `${origin}/${slug}${pick(paths)}` };
	},

	function gamingTheme(origin) {
		const slug = `free-${randomHex(3)}`;
		const paths = [
			`/robux/claim?amt=999999&uid=${randomHex(4)}`,
			`/vbucks/redeem?code=${randomHex(6)}`,
			`/dominus/transfer?to=${randomHex(4)}`,
			`/premium/unlock?token=${randomHex(6)}`,
		];
		return { slug, susUrl: `${origin}/${slug}${pick(paths)}` };
	},

	function rizzTheme(origin) {
		const slug = `rizz-${randomHex(3)}`;
		const paths = [
			`/certified?level=godtier&aura=${randomInt(100, 999)}`,
			`/sigma/check?grindset=${randomHex(4)}`,
			`/fanum/collect?food=pizza&uid=${randomHex(4)}`,
			`/gyatt/results?score=over9000`,
		];
		return { slug, susUrl: `${origin}/${slug}${pick(paths)}` };
	},

	function aiTheme(origin) {
		const slug = `gpt-${randomHex(3)}`;
		const paths = [
			`/jailbreak/DAN?token=${randomHex(6)}`,
			`/free-access?bypass=true&uid=${randomHex(4)}`,
			`/gf/setup?vibe=tsundere`,
			`/gpt5/claim?invite=${randomHex(6)}`,
		];
		return { slug, susUrl: `${origin}/${slug}${pick(paths)}` };
	},

	function npcTheme(origin) {
		const slug = `npc-${randomHex(3)}`;
		const paths = [
			`/1984/track?citizen=${randomHex(4)}`,
			`/touch-grass?skill_issue=true`,
			`/main-char/check?delulu=verified`,
			`/cope/redirect?ratio=${randomHex(4)}`,
		];
		return { slug, susUrl: `${origin}/${slug}${pick(paths)}` };
	},
];

function generateSusLink(origin) {
	return pick(themes)(origin);
}

async function isRateLimited(redis, ip) {
	const key = `ratelimit:${ip}`;
	const count = await redis.incr(key);
	if (count === 1) {
		await redis.expire(key, 3600); // reset every hour
	}
	return count > 10;
}

// ---- worker ----

export default {
	async fetch(request, env, ctx) {
		// handle preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		const redis = new Redis({
			url: env.UPSTASH_REDIS_REST_URL,
			token: env.UPSTASH_REDIS_REST_TOKEN,
		});

		const url = new URL(request.url);
		const path = url.pathname;

		// POST /shorten
		if (request.method === 'POST' && path === '/shorten') {
			// verify secret
			const secret = request.headers.get('x-api-secret');
			if (!secret || secret !== env.API_SECRET) {
				return new Response('Unauthorized', { status: 401, headers: corsHeaders });
			}

			const ip = request.headers.get('cf-connecting-ip') || 'unknown';
			if (await isRateLimited(redis, ip)) {
				return new Response('Too many requests. Chill.', {
					status: 429,
					headers: corsHeaders,
				});
			}

			const body = await request.json();
			let originalUrl = body.url;

			if (!originalUrl) {
				return new Response('Missing url', { status: 400, headers: corsHeaders });
			}

			// fix missing protocol
			if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
				originalUrl = 'https://' + originalUrl;
			}

			// validate URL
			try {
				new URL(originalUrl);
			} catch {
				return new Response('Invalid URL', { status: 400, headers: corsHeaders });
			}

			const { slug, susUrl } = generateSusLink('https://skbidi.xyz');
			await redis.set(slug, originalUrl, { ex: 60 * 60 * 24 * 30 }); // 30 days
			await redis.incr('total_links_generated');

			return Response.json({ shortUrl: susUrl, slug }, { headers: corsHeaders });
		}

		// GET /global-stats
		if (request.method === 'GET' && path === '/global-stats') {
			const linksGenerated = (await redis.get('total_links_generated')) || 0;
			const victimsTricked = (await redis.get('total_victims_tricked')) || 0;

			return Response.json(
				{
					linksGenerated: Number(linksGenerated),
					victimsTricked: Number(victimsTricked),
				},
				{ headers: corsHeaders }
			);
		}

		// GET /:slug → redirect
		if (request.method === 'GET' && path.length > 1) {
			const slug = path.split('/')[1];
			const destination = await redis.get(slug);

			if (!destination) {
				return new Response('Not found', { status: 404, headers: corsHeaders });
			}

			ctx.waitUntil(redis.incr(`clicks:${slug}`));
			ctx.waitUntil(redis.incr('total_victims_tricked'));

			return Response.redirect(destination, 302);
		}

		return new Response('sus-redirector alive', { status: 200, headers: corsHeaders });
	},
};