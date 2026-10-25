
# Pharmacy Management App — Project Rules

## Project Goal
Build a secure, production-oriented Pharmacy Management App for a single pharmacy business in Bangladesh.

## Required Technology
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Authentication
- MongoDB Atlas
- Next.js Route Handlers
- Recharts
- Sonner toast notifications
- Framer Motion or lightweight CSS animations
- Vercel deployment

Use the existing package manager if the repository already has one. Otherwise, use npm.

## Core Rules
1. Build the complete requested application, not just a UI prototype.
2. Use English for interface labels and navigation. Support Bangla Unicode in medicine names, notes, categories, and user-entered content.
3. Use BDT (৳) and the Asia/Dhaka timezone.
4. Require an authenticated and authorized account for all business data access and changes.
5. Firebase Authentication handles identity. MongoDB stores user roles, permissions, pharmacy data, and audit logs.
6. Never use Firestore as the application database.
7. Never trust client-provided roles, permissions, prices, totals, profit calculations, or audit metadata.
8. Validate all API inputs on the server.
9. Never expose MongoDB credentials, Firebase Admin credentials, or bootstrap secrets in client code.
10. Never hardcode passwords or commit real secrets to GitHub.
11. Do not allow public registration to create Admin or Super Admin accounts.
12. Use server-side permission checks on every protected API endpoint.
13. Preserve historical sale prices and cost snapshots.
14. Avoid unnecessary features, dependencies, and overengineering.
15. Every visible button and control must perform its stated action.
16. Confirm destructive operations before executing them.
17. Use accessible labels, keyboard navigation, visible focus states, and adequate contrast.

## Application Scope
Required pages:
- Dashboard
- New Sale / POS
- Medicines / Stock
- Daily Accounts, including expenses
- Reports
- Settings / Profile
- User approval and permission management

Do not add supplier management, purchase-order management, customer profiles, loyalty programs, prescriptions, expiry tracking, batch tracking, or barcode scanning unless explicitly requested later.

## UI Rules
- Premium neumorphic design across the entire application.
- Compact, professional business interface.
- Subtle transitions and liquid-style button hover effects.
- Fixed desktop sidebar and top header.
- Responsive hamburger navigation on smaller screens, with an obvious close button.
- Use shadcn/ui and consistent design tokens.
- Use toast notifications and confirmation dialogs.
- No horizontal overflow on mobile, tablet, or desktop.
- POS must remain fast and usable on small screens.

## Build and Verification
The selected strategy is a one-shot full-app build. Implement all requested features during the main build, then run checks and fix failures.

Run available lint, typecheck, tests, and production build commands.

Never fabricate test results. Clearly report any integration steps that require real Firebase or MongoDB credentials.
