# Localhost vs Production — Comparison & Debug Checklist

## Summary

This document explains the key differences between running the procurement app on `localhost` (development) and running it in production, and gives concrete checks to find why the procurement UI crashes in production with `Uncaught TypeError: $.map is not a function`.

## Key differences that commonly affect behavior

- **Build and bundling**: Local runs often use unminified dev bundles, hot-reload, and source maps; production uses minified bundles and different bundlers/plugins which can change load order and available globals (like `$`).
- **API responses & data shapes**: Local test data can differ from production data. Production may return `null`, `{}`, or a single object where local returns `[]`.
- **Third-party libraries**: jQuery or other globals may be present locally but omitted or tree-shaken in production bundles. `$.map` may be undefined in production.
- **Race conditions & timing**: Production networks are slower or faster (CDN caching) and timing differences can expose race conditions (mapping before data arrives).
- **Environment variables / feature flags**: Different flags may enable/disable code paths. A production-only code path could assume a different payload shape.
- **Authentication & roles**: Production users have different roles or aggregated permissions; code that runs for a production role (e.g., procurement) might not be exercised locally.
- **Caching & proxies**: Reverse proxies or CDNs may alter responses or cache outdated shapes.
- **Socket/io behavior**: Production socket servers, namespaces, or auth may differ; event handlers might fire differently.

## Why this bug appears in production but not locally (likely causes)

- The procurement view calls `$.map()` or `.map()` without verifying the response is an array. In production the payload for that code path is not an array (maybe `null` or an object), causing `TypeError`.
- Alternatively, the production bundle may not include jQuery or `$` is overwritten so `$.map` is missing.
- A production-only feature flag or role check may cause the procurement code to initialize earlier or with different data.

## Concrete checks to run (order matters)

1. Compare API responses

 - From production (or a production-like environment), fetch the endpoint used by the procurement view and save the JSON.

 ```bash
 curl -s -H "Authorization: Bearer <token>" "https://procurement.example.com/api/purchase-requests?tab=procurement" -o prod_response.json
 curl -s -H "Authorization: Bearer <token>" "http://localhost:3000/api/purchase-requests?tab=procurement" -o local_response.json
 ```

 - Compare shapes: `jq` helps a lot: `jq 'keys' prod_response.json` and inspect `prod_response.json` for `null` vs `[]`.

2. Inspect browser console & network in production

 - Open DevTools, Network tab, filter the request for purchase requests, copy response and compare to local.
 - Save the console stacktrace showing `$.map is not a function` — it often shows the line in the minified bundle.

3. Verify `$`/jQuery availability in production bundle

 - In production DevTools Console, run:

 ```js
 typeof $;
 typeof $.map;
 Array.isArray(window.__PR_DUMP__); // if you can expose data for inspection
 ```

 - If `typeof $.map === 'undefined'` then the code assumed jQuery but it isn't present.

4. Compare frontend bundle versions

 - Check `package.json` + `yarn.lock` / `package-lock.json` used for production build; ensure same versions are used locally.

5. Check feature flags / env vars

 - Compare `process.env` values used at build time (e.g. `NODE_ENV`, `REACT_APP_*`) between local and prod. A flag may change data paths.

6. Reproduce the failing payload locally

 - If the production response is single-object or `null`, mimic it locally and confirm the crash.

## Quick fixes and where to apply them

- **Frontend hotfix (fastest, low-risk):** normalize input before mapping. Add `ensureArray()` or `Array.isArray()` guard where `$.map` / `.map` is called.
- **Bundle fix:** ensure jQuery is present if legacy code relies on `$.map`, or refactor to native `Array.map`.
- **Backend fix:** ensure list endpoints always return arrays (e.g., `[]` for empty lists). Strongly recommended.

## Diagnostic commands and examples

- Get production payload (example using token):

```bash
curl -s -H "Authorization: Bearer $PROD_TOKEN" \
  "https://procurement.example.com/api/purchase-requests?tab=procurement" | jq '.' > prod_payload.json
```

- Minimal Node script to fetch and inspect type:

```js
const fetch = require('node-fetch');
(async()=>{
 const res = await fetch(process.argv[2], { headers: { Authorization: 'Bearer '+process.env.TOKEN }});
 const json = await res.json();
 console.log('type:', Object.prototype.toString.call(json));
 console.log('isArray:', Array.isArray(json));
 console.log(JSON.stringify(json, null, 2).slice(0,1000));
})();
```

## Logging to add (short-term)

- On the frontend, before mapping: `console.debug('procurement payload', response && response.data);`
- On the backend, log when the payload shape deviates from expected.

## Recommended immediate plan

1. Run the payload comparison steps and paste the production response here. (I can run these if you provide a sample or a read-only token.)
2. Apply frontend guard (`ensureArray`) and deploy as hotfix.
3. Add a backend validation to normalize lists.
4. Add tests (unit + E2E) for the full workflow paths, including the path that skips procurement.

## Reference

- Issue summary: [docs/PR_MAP_ERROR.md](docs/PR_MAP_ERROR.md)

---

If you want, I can (A) fetch a production payload if you provide a URL and a token, or (B) implement the frontend guard now and run local tests. Which do you prefer?