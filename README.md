# Free QR Code Generator

100% free QR code maker with **no watermark**, **no signup**, and unlimited PNG, JPG, WebP, and SVG downloads.

- GitHub Pages: **https://sabithpkcmnr.github.io/qr-code-generator/**
- Hostinger: deploy this folder as a Node.js app (`npm start`)

## Run locally

```bash
npm start
```

Then open http://localhost:3000/

Or serve the static files:

```bash
python3 -m http.server 5173 --bind 127.0.0.1
```

## Hostinger Node app

The app has no npm dependencies. Hostinger only needs:

- Start command: `node server.js`
- Node 18+
- `PORT` from the environment (the server already reads it)

Canonical URLs, Open Graph tags, `robots.txt`, and `sitemap.xml` follow the domain you assign, so GitHub Pages and a Hostinger domain can both work.
