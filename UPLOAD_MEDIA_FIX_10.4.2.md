# Upload/media hotfix 10.4.2

- Keeps the existing `/uploads/:path*` proxy to Central Admin.
- Renders managed `/uploads/...` assets with a native `<img>` so dynamic uploaded media does not depend on Next image optimization.
- Adds verification guards for the proxy/runtime image path.
