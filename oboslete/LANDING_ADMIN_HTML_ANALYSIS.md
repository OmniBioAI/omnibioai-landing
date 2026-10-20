# Landing Admin HTML Analysis

Scope: read-only inspection of `admin.html` and its companion beta form in `index.html`. No live Worker/API requests were made. The Worker source was not present in the local ecosystem search, so observations about its server-side behavior are limited to what the browser calls and what its UI claims.

## Admin page

| Concern | Implementation and evidence |
|---|---|
| Worker base URL | `WORKER_URL` is `https://beta-requests.mandecent-gupta.workers.dev` at `admin.html:284`. |
| Login | `login()` at `admin.html:289-306` reads the password input, sends `GET /admin/requests` with `X-Admin-Key`, and treats any `res.ok` as a successful login. The entered value is stored in `sessionStorage` as `admin_key` (`admin.html:292-299`). This is a Worker-verified shared-key check as presented by the client; it is not an auth-service login/JWT flow. No password value is printed here. |
| Session/logout | `getAdminKey()` reads the session value (`admin.html:285`); startup resumes the UI if one is present (`admin.html:315-319`). `logout()` removes it (`admin.html:308-313`). |
| Request retrieval | `loadRequests()` calls `GET /admin/requests` with `X-Admin-Key`; successful JSON is assigned directly to `allRequests` (`admin.html:321-329`). Login makes the same GET (`admin.html:292-304`). Expected response is an array-like JSON value consumed as request records; exact server schema is not available. |
| Approve handler | `approve(id, fromDrawer=false)` at `admin.html:442-457` reads optional note, mutates the in-memory record to approved, and sends `PATCH /admin/requests/{id}` with JSON `{status:"approved",note}` and `X-Admin-Key`. It ignores the response status/body and suppresses fetch errors, then displays “approved — email sent.” |
| Reject handler | `reject(id, fromDrawer=false)` at `admin.html:459-474` confirms, mutates local status, then sends `PATCH /admin/requests/{id}` with `{status:"rejected"}`. It likewise ignores response status/body and suppresses fetch errors. |
| Resend action | `resendEmail(id)` at `admin.html:476-479` only displays a toast. It makes no request and sends no email. |
| License generation | No license-generation function, key field, validity selector, or licensing API request exists in `admin.html`. The only mutation associated with approval is the beta-request PATCH above. |
| Persistence | Request state is fetched from and PATCHed to the Worker. The browser does not persist a license or approval record beyond its in-memory array/session key. Worker storage is unknown. |
| Email | Approval UI advertises an email (`admin.html:272-273`, `456`) but contains no mail client or email API call. Whether the Worker sends an email, and what it contains, cannot be verified from this repository. |

## Beta application submission

`index.html` defines the request fields at `index.html:1421-1498`. `handleSubmit(event)` at `index.html:1592-1628` sends a `POST` to the same Worker’s `/submit` endpoint (`index.html:1611-1615`) with JSON fields `first_name`, `last_name`, `email`, `institution`, `role`, `platform`, `use_case`, and `research` (`index.html:1601-1610`). On any successful HTTP status it shows a submitted state; it does not inspect a response body. This describes the client contract only.

## Deployment/configuration evidence

The repository is a static site. `.github/workflows/ci.yml:42-57` deploys the static repository to GitHub Pages on pushes to `main`; it does not deploy a Worker. No Worker source, Wrangler configuration, secret binding, or API-handler code is present in this repository. Local ecosystem search found no implementation matching this Worker URL or `/admin/requests`/`X-Admin-Key`.

The request stops at the external Worker URL. No backend behavior is inferred from its endpoint names or from the admin toast.
