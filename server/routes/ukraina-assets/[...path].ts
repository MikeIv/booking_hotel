export default defineEventHandler(async (event) => {
  const pathParam = getRouterParam(event, "path");
  if (!pathParam) {
    throw createError({ statusCode: 400, statusMessage: "Missing asset path" });
  }

  const normalizedPath = `/${pathParam}`.replace(/\/{2,}/g, "/");
  const targetUrl = new URL(`https://www.ukraina-hotel.ru${normalizedPath}`);
  const query = getQuery(event);

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        targetUrl.searchParams.append(key, String(item));
      }
    } else if (value != null) {
      targetUrl.searchParams.set(key, String(value));
    }
  }

  const upstreamResponse = await fetch(targetUrl.toString(), {
    method: "GET",
    headers: {
      "user-agent": "Grand-Booking-Proxy/1.0",
      accept: "*/*",
    },
  });

  if (!upstreamResponse.ok) {
    throw createError({
      statusCode: upstreamResponse.status,
      statusMessage: `Upstream asset error: ${upstreamResponse.status}`,
    });
  }

  const contentType =
    upstreamResponse.headers.get("content-type") ?? "application/octet-stream";
  const cacheControl =
    upstreamResponse.headers.get("cache-control") ?? "public, max-age=86400";
  const etag = upstreamResponse.headers.get("etag");
  const lastModified = upstreamResponse.headers.get("last-modified");

  setHeader(event, "content-type", contentType);
  setHeader(event, "cache-control", cacheControl);
  setHeader(event, "x-proxied-by", "ukraina-assets");
  if (etag) setHeader(event, "etag", etag);
  if (lastModified) setHeader(event, "last-modified", lastModified);

  const arrayBuffer = await upstreamResponse.arrayBuffer();
  return send(event, Buffer.from(arrayBuffer));
});
