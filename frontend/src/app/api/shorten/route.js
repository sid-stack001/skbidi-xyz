export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(
      "https://sus-redirector.siddharthv643.workers.dev/shorten",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": process.env.API_SECRET,
        },
        body: JSON.stringify(body),
      },
    );

    if (!res.ok) {
      return Response.json(
        { error: "Failed to shorten" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
