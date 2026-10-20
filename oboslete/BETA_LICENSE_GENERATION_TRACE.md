# Beta License Generation Trace

## Result

The checked-in website code does not generate a license key. Admin approval sends a status/note update to a Cloudflare Worker endpoint. The Worker implementation is unavailable in the local ecosystem, so it is not possible to verify whether that service generates a key, writes a license record, calls `omnibioai-auth`, sends email, or does something else. The frontend’s “email sent” toast is not evidence of successful delivery: `approve()` ignores the PATCH response and catches network errors without surfacing them (`admin.html:442-457`).

## Browser-to-backend trace

1. Admin enters a password and `login()` calls `GET https://beta-requests.mandecent-gupta.workers.dev/admin/requests` with `X-Admin-Key` (`admin.html:289-306`). An OK response is treated as authenticated; its JSON is loaded into the UI. The password is kept in tab-scoped `sessionStorage` (`admin.html:285, 295`).
2. The requests are retrieved again by `loadRequests()` using the same GET and header (`admin.html:321-329`). The client expects a JSON array of records with fields used in rendering, including `id`, names, email, institution, role, use case, submitted time, status, and optional note (`admin.html:333-397, 408-420`). No authoritative Worker response schema is present locally.
3. Clicking approve calls `approve(id, fromDrawer)`. It optimistically changes the local record, then sends `PATCH https://beta-requests.mandecent-gupta.workers.dev/admin/requests/{id}`, headers `Content-Type: application/json` and `X-Admin-Key`, body `{ "status": "approved", "note": <string> }` (`admin.html:442-453`). It does not check `response.ok`, parse a response, or retry. The drawer's “Approve & Send Email” and the list checkmark both call this handler (`admin.html:390-393, 422-425`).
4. The UI displays an “email sent” toast after the fetch attempt, including after a non-2xx response because status is never checked (`admin.html:454-456`). `resendEmail()` is a toast-only function (`admin.html:476-479`).
5. Reject sends the same PATCH route with `{ "status": "rejected" }` (`admin.html:459-474`). The approved drawer offers “Revoke Access,” but it invokes that same beta request rejection PATCH; it is not a verified license revocation API (`admin.html:426-430`).

The public form separately POSTs the request JSON to `https://beta-requests.mandecent-gupta.workers.dev/submit` (`index.html:1592-1627`). This does not carry or generate a license key.

## License contract visible in the website

| Contract item | Verified website evidence |
|---|---|
| Key format / algorithm | Not present in website source. |
| Generation location | Not established. `admin.html` does not generate a key. Worker internals are absent. |
| Validity | The marketing copy describes a 30-day free trial (`README.md:49`, `index.html:1229-1230, 1254`); this does not prove the beta approval Worker issues a 30-day license. No admin validity input or API field exists. |
| Role/license type | Beta application role values are submitted for review (`index.html:1442-1452`), but no role-to-license mapping is visible. |
| Identity/email binding | Application contains an email field (`index.html:1432-1435`); no license binding behavior is visible. |
| Activation / expiry / revocation | No website issuance or activation mechanism is visible. “Revoke Access” changes beta request status via Worker PATCH only. License-level semantics are unknown. |
| Persistence | The Worker is the only server-side boundary receiving request submission/status updates. No license store is present in this repository; Worker persistence is unknown. |
| Delivery | The approve UI says “email sent,” but no email implementation or verified Worker response appears. Exact provider, message, and whether delivery occurs are unknown. |

## Exact verification boundary

The local trace ends at the request to `beta-requests.mandecent-gupta.workers.dev`. The landing repository contains only static pages and GitHub Pages deployment configuration (`.github/workflows/ci.yml:42-57`). Searching the adjacent local ecosystem found no Worker source or matching endpoint handler. No live endpoint was called. Consequently, no backend issuance, storage, mail, or Worker-to-auth integration behavior can be asserted.
