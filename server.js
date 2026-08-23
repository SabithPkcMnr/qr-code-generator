const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DENY = new Set(["server.js", "package.json", "package-lock.json", ".gitignore", "README.md"]);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function siteOrigin(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || (/localhost|127\.0\.0\.1/.test(String(host)) ? "http" : "https");
  return `${proto}://${host}`.replace(/\/$/, "");
}

function send(res, status, body, type) {
  res.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": status === 200 ? "public, max-age=300" : "no-store",
  });
  res.end(body);
}

function sitemap(origin) {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

function robots(origin) {
  return `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}

const server = http.createServer((req, res) => {
  const origin = siteOrigin(req);
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

  if (urlPath === "/sitemap.xml") {
    send(res, 200, sitemap(origin), TYPES[".xml"]);
    return;
  }
  if (urlPath === "/robots.txt") {
    send(res, 200, robots(origin), TYPES[".txt"]);
    return;
  }

  let relative = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  if (relative.endsWith("/")) relative += "index.html";
  const base = path.basename(relative);
  if (DENY.has(base) || relative.includes("..") || relative.startsWith(".")) {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
    return;
  }

  const file = path.join(ROOT, relative);
  if (!file.startsWith(ROOT)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
    send(res, 200, data, type);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`QR generator running on port ${PORT}`);
});
