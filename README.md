# skbidi-xyz

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=flat&logo=cloudflare&logoColor=white)
![Upstash Redis](https://img.shields.io/badge/Upstash%20Redis-00E9A3?style=flat&logo=redis&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

A URL shortener that makes any link look extremely suspicious (or should i say brainrot) but it still works exactly like you'd expect when clicked.

**Live: [skbidi.xyz](https://skbidi.xyz)**

```
you paste:    https://google.com
you get:      https://skbidi.xyz/npc-80e/touch-grass?skill_issue=true
your friend:  *visible confusion, then panic*
the link:     redirects perfectly fine to google.com the whole time
```
<img width="836" height="574" alt="image" src="https://github.com/user-attachments/assets/37e8bb31-8280-470f-a56a-ebf7453d5ad4" />


## Why this exists

This started as a "let's learn some real SWE stuff by building something dumb" project. No tutorials, no boilerplate templates, just picking a silly idea and figuring out the full stack needed to ship it for free, end to end, in a weekend.

Turns out a joke URL shortener touches almost the same infrastructure as a real one: DNS, edge functions, a KV store, CORS, rate limiting, and deployment pipelines. So this became a genuinely useful way to learn those pieces hands-on.

## How it works


```
┌─────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Browser   │ ──────▶ │  Next.js (Vercel) │ ──────▶ │ Cloudflare Worker │
│ skbidi.xyz  │         │  /api/shorten     │  secret │  validates +      │
└─────────────┘         │  (holds the auth  │  header │  generates slug   │
                         │   secret server-  │ ──────▶ │  writes to Redis  │
                         │   side only)      │         └─────────────────┘
                         └──────────────────┘                  │
                                                                 ▼
                                                          ┌─────────────┐
                                                          │ Upstash Redis│
                                                          │ slug → URL   │
                                                          └─────────────┘
```

When someone **clicks** a generated link, the request goes straight from the browser to the Worker (via a Vercel rewrite), which looks up the slug in Redis and issues a 302 redirect to the real URL. No auth needed for reads; that's the whole point of a public short link.

When someone **creates** a link through the UI, the request first hits a Next.js API route that holds a server-side secret, which is the only thing allowed to call the Worker's write endpoint. This stops randoms from finding the Worker URL in the public repo and spamming the database directly.

### The brainrot slug generator

Every link gets randomly assigned one of five "themes," each producing a short, deeply unserious path + query string:

- `skibidi-*` — `/ohio/rizz?gyatt=...`
- `free-*` — `/robux/claim?amt=999999`
- `rizz-*` — `/certified?level=godtier`
- `gpt-*` — `/jailbreak/DAN?token=...`
- `npc-*` — `/touch-grass?skill_issue=true`

Short enough to paste in a chat, unhinged enough to make someone hesitate before clicking.

## Stack

| Layer | Tool | Why |
|---|---|---|
| Frontend | Next.js (App Router) | Hosted free on Vercel, server API routes for secret handling |
| Backend | Cloudflare Workers | Free tier, runs at the edge, zero cold starts |
| Database | Upstash Redis | Free tier, REST API works great from Workers, TTL support |
| Hosting | Vercel + Cloudflare | Both have generous free tiers that don't sleep or expire |
| Domain | `skbidi.xyz` | Bought for less than the price of a shawarma |

## Features

- Real slug generation across five rotating brainrot themes
- Per-link click tracking + a global "links generated" / "victims tricked" counter
- Rate limiting (10 links/hour per IP) to keep the free tier free
- Links auto-expire after 30 days so the database doesn't fill up

## What I actually learned building this

- DNS, nameservers, and what a CNAME vs A record actually does in practice
- The difference between a public endpoint and a public *write* endpoint, and why only one of those needs protecting
- `ctx.waitUntil()` in Cloudflare Workers, background work after a response is sent will get killed unless you explicitly tell the runtime to keep waiting for it
- CORS preflight requests and why a POST silently fails without an `OPTIONS` handler
- That `curl` printing raw HTML to your terminal is correct behavior, not a bug (cost me twenty minutes of confusion, will not be doing that again)

## Running it locally

```bash
# frontend
cd frontend
npm install
npm run dev

# worker
cd worker
npm install
npx wrangler dev
```

You'll need your own Upstash Redis instance and to set the following as Worker secrets (`wrangler secret put <NAME>`) and frontend env vars:

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
API_SECRET
```

## Disclaimer

This is a prank tool for friends, not a phishing kit. It doesn't collect personal data, doesn't fake login pages, and every link does exactly what it says it'll do once clicked: redirect to the real destination. Please don't be a menace with it.

---

Built in a weekend, mostly to see if I could ship something (anything) completely free and have it actually stay up.


*assisted by Claude, who patiently explained why `curl` printing HTML wasn't a bug, why `redis.incr()` without `await` doesn't actually finish, and why the route order in an `if` chain matters more than I thought it did*
