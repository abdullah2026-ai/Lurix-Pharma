
---
name: firebase-auth
description: Implement Firebase login and registration with secure MongoDB role and permission enforcement.
---

# Firebase Authentication Skill

- Firebase Authentication establishes user identity.
- MongoDB is the source of truth for application roles, status, permissions, and discount limits.
- Verify Firebase ID tokens or secure session cookies on the server.
- Public registration creates a pending Employee profile only.
- Never accept a requested role, status, permission set, or discount limit from registration input.
- Pending and disabled users cannot access pharmacy business data.
- Admin or Super Admin must approve employees and assign permissions.
- Provision the initial Super Admin through Firebase Console and a secure one-time server-side process.
- Never hardcode passwords or grant Super Admin to the first registrant.
- Keep Firebase Admin credentials in server-side environment variables.
- Document Firebase setup and allowed-domain configuration.
- Test invalid tokens, pending users, disabled users, restricted employees, Admin, and Super Admin.
