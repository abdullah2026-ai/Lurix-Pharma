
---
name: mongodb-api-security
description: Secure MongoDB data access, API validation, permissions, stock operations, and audit records.
---

# MongoDB + API Security Skill

- Treat all browser input as untrusted.
- Validate request bodies, query parameters, IDs, enums, and numeric values on the server.
- Verify Firebase identity server-side.
- Load roles, status, and permissions from MongoDB.
- Deny access to pending and disabled users.
- Enforce permissions inside every protected API route.
- Keep MongoDB URI and Firebase Admin credentials server-only.
- Create a unique normalized medicine-name index and appropriate UID, sale, and audit indexes.
- Use MongoDB Atlas transactions for multi-record financial and inventory operations when supported.
- Prevent negative stock under concurrent requests.
- Handle failures explicitly and avoid partial updates.
- Store server-generated audit actor and timestamp values.
- Keep audit logs append-only.
- Never log passwords, access tokens, private keys, or secrets.
- Return safe errors without exposing internal stack traces or database details.
