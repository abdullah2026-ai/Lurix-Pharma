
# MASTER PROMPT — PHARMACY MANAGEMENT APP

Act as a senior full-stack engineer, security architect, pharmacy business systems designer, and UI/UX specialist.

Build a complete, functional Pharmacy Management App for one pharmacy business in Bangladesh. Inspect the existing repository first. If no valid application exists, create a clean Next.js project.

The selected strategy is ONE-SHOT FULL APP BUILD.

Implement the full requested scope, run checks, fix errors, and report the actual results. Do not stop after generating a plan, a static UI, or mock data.

Follow AGENTS.md and the skills in .agents/skills/ throughout implementation.

## 1. TECH STACK

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Authentication
- MongoDB Atlas for all application data
- Server-side Next.js Route Handlers
- Zod for validation
- Recharts for dashboard charts
- Sonner for toast notifications
- Framer Motion or restrained CSS animations
- Vercel-compatible architecture

Use server components by default and client components only where interaction is needed.

## 2. DESIGN SYSTEM

Create a premium, consistent neumorphic interface across login, registration, dashboard, POS, forms, dialogs, cards, and settings.

Design requirements:
- Professional, compact layout
- Consistent spacing, typography, radii, shadows, and component styles
- Subtle motion and liquid-style button hover effects
- Accessible contrast and visible keyboard focus
- Clear loading, empty, error, success, and disabled states
- shadcn/ui components
- Confirmation dialog before destructive actions
- Toast notifications for relevant success and error feedback
- Fixed desktop sidebar and top header
- Collapsible hamburger drawer on tablet and mobile
- Sidebar has a clear close button, closes on outside click, Escape, and navigation
- Fully responsive POS, tables, forms, charts, dialogs, and navigation

Prevent horizontal overflow at mobile, tablet, and desktop widths.

Interface labels and navigation must be in English only. Bangla Unicode must work in medicine names, notes, categories, and other user-entered fields.

Use BDT (৳) and Asia/Dhaka date/time formatting.

Do not add unnecessary pages or decorative controls that do not work.

## 3. PAGES

Implement:
1. Dashboard
2. New Sale / POS
3. Medicines / Stock
4. Daily Accounts, including expenses
5. Reports
6. Settings / Profile
7. User approval and permission management for authorized users

Do not add supplier management, purchase orders, customer profiles, loyalty, prescriptions, expiry/batch tracking, barcode scanning, or unrelated features.

## 4. AUTHENTICATION AND USER ACCESS

Firebase Authentication handles login identity. MongoDB stores the application user profile and authorization data.

Support:
- Login
- Employee registration
- Super Admin
- Admin
- Employee
- Individual employee permissions
- Per-employee maximum discount limits
- Employee approval and account disabling
- Audit trail for sensitive changes

Registration must create a pending Employee account with no business-data access.

An Admin or Super Admin must approve the employee and assign permissions. Public registration must never grant privileged roles.

Every protected route must verify Firebase identity server-side and then load the user's current status, role, and permissions from MongoDB.

Do not trust role or permission values sent by the browser.

Create permission checks for:
- Dashboard viewing
- POS and sales
- Stock viewing
- Stock addition/editing
- Medicine price editing
- Daily accounts
- Expense management
- Reports
- Settings
- User management
- Sale editing/cancellation
- CSV import/export

Medicine price editing requires its own permission.

Enforce an individual maximum discount limit for every employee. Validate both fixed-amount and percentage discounts on the server.

### Initial Super Admin Setup

Provision the initial Super Admin securely through Firebase Console and a one-time server-side bootstrap or seed process.

Never hardcode the supplied Super Admin password. Never put it in source code, client bundles, documentation, tests, GitHub, or logs.

Use a server-only bootstrap secret if required, and remove or disable the bootstrap mechanism after successful provisioning.

Never grant Super Admin access to the first public registrant.

Provide clear setup instructions for Firebase Authentication and secure Super Admin provisioning.

## 5. MONGODB ARCHITECTURE

Use server-only MongoDB access.

Create suitable collections or models for:
- User profiles and permissions
- Medicines
- Stock movements
- Sales
- Expenses
- Audit logs
- Minimal pharmacy settings

Use a reusable, cached MongoDB connection pattern suitable for Vercel serverless functions.

Create appropriate indexes, including:
- Unique normalized medicine name
- Unique Firebase UID
- Sale date/time
- Audit entity and timestamp
- Other necessary lookup indexes

Use transactions where supported by MongoDB Atlas for operations that affect multiple records.

Prevent negative stock during concurrent sales.

Do not silently leave partially updated stock, sales, or financial records if an operation fails.

## 6. MEDICINES AND INVENTORY

Each medicine should support:
- Medicine name
- Optional Bangla name
- Optional category and notes
- Base stock unit
- Current quantity
- Average purchase cost
- Selling price for each configured sale unit
- Configurable unit conversions
- Low-stock threshold, default 10
- Creation/update metadata

Prevent duplicate medicine names using normalized comparison and a database unique index.

If a duplicate is submitted, show a clear error and offer to open the existing medicine.

### Flexible Units

Support units such as Tablet, Strip, Box, Bottle, and Piece.

Each medicine can have a base stock unit and optional conversion factors.

Example:
1 Strip = 10 Tablets.

Conversion must be configurable per medicine. Do not assume every medicine uses the same conversion.

Allow a separate selling price for each configured sale unit. Do not automatically force every unit price to be a mathematical multiple of the base-unit price.

Convert sold quantities into the base stock unit before checking and decrementing stock.

Validate that all quantities, conversion factors, and prices are valid and positive where required.

### Adding Stock and Weighted Average Cost

Provide a controlled Add Stock action inside Medicines / Stock.

Do not build supplier or purchase-order management.

When additional stock is added, calculate weighted average cost using quantities and costs normalized to the same base unit:

New average cost =
(old quantity × old average cost + added base quantity × new base-unit cost)
÷ (old quantity + added base quantity)

Handle zero existing stock safely.

Record stock movements and the responsible account for traceability.

### Low Stock

Use a default low-stock threshold of 10 base units.

Show low-stock medicines on the Dashboard and display a toast notification when a stock change causes a medicine to enter the low-stock state.

Do not add a separate notification center, SMS system, or email alert system.

The selected requirement is Dashboard + toast notification.

### Medicine Data Entry

Support:
- Manual entry
- CSV import
- CSV export

CSV import must include preview, validation, duplicate detection, row-level error reporting, and permission checks before committing changes.

## 7. POS AND SALES

Implement a fast mini POS with medicine search and Add to Cart.

The cart must support:
- Multiple medicines
- Configured sale units
- Quantity
- Per-unit selling price
- Subtotal
- Fixed-amount discount
- Percentage discount
- Final total
- Payment method

Payment methods:
- Cash
- bKash
- Nagad

Do not collect customer name, phone number, or customer profile information.

Validate discounts on the server against the signed-in employee's maximum discount limit.

Do not trust totals calculated by the browser. Recalculate totals and profit inputs on the server using validated database data.

On sale:
1. Validate the user's permission.
2. Load current medicine data.
3. Convert sale quantities into base stock units.
4. Verify sufficient stock.
5. Calculate the sale using authoritative server data.
6. Snapshot the relevant cost and selling prices.
7. Record the sale and payment method.
8. Decrement stock consistently.
9. Append an audit record.
10. Return the completed sale and printable receipt data.

Reject insufficient stock. Never allow negative stock due to concurrent requests.

Use MongoDB transactions when supported. Implement and document a safe consistency strategy if transactions are unavailable.

## 8. RECEIPTS

Provide a printable receipt optimized for 58mm and 80mm thermal printers using browser printing.

Include:
- Pharmacy name and basic receipt settings
- Unique sale number
- Date and time in Asia/Dhaka
- Medicine name
- Unit and quantity
- Item price and subtotal
- Discount
- Final total
- Payment method
- Footer

No customer details are required.

Create a print-specific stylesheet that hides the sidebar, header, navigation, dialogs, and other application UI.

Support ordinary browser printing as well as compatible thermal printers. Do not claim direct hardware integration beyond browser printing.

## 9. SALE EDITING AND CANCELLATION

Authorized users may edit or cancel sales according to their permissions.

On edit:
- Reverse the original stock movement
- Validate the corrected sale
- Apply the corrected stock movement
- Recalculate sale totals and profit from stored snapshots and corrected data
- Update relevant payment breakdowns
- Append an audit entry

On cancellation:
- Restore the previously sold stock
- Mark the sale as cancelled rather than silently erasing its history
- Exclude the cancelled sale from active sales and profit totals
- Update relevant reports and payment totals
- Append an audit entry

Do not physically delete financial history as the normal cancellation mechanism.

Prevent partial updates if an operation fails. Use MongoDB transactions where supported.

Audit entries must include:
- Actor UID and display identifier
- Action
- Entity type and ID
- Server-generated timestamp
- Relevant before/after changes

Never trust audit actor or timestamp values from the client.

Show a compact audit history beneath or within the relevant sale details, including who changed it and when.

Historical cost and selling-price snapshots must remain stable when current medicine prices change.

## 10. DAILY ACCOUNTS AND EXPENSES

The Daily Accounts page must show:
- Today's sales
- Gross profit
- Total expenses
- Net profit
- Cash sales
- bKash sales
- Nagad sales

Correct formulas:

Net sales = item subtotal − discount

COGS = sum of sold base quantity × historical base-unit cost

Gross profit = net sales − COGS

Net profit = gross profit − recorded expenses

Do not label revenue as profit.

Use the sale's historical cost snapshots to calculate COGS.

### Expenses

Include preset categories:
- Rent
- Electricity
- Salary
- Transport

Also allow a custom category.

Expense records include amount, category, optional note, date/time, and creator.

Enforce permissions for creating and editing expenses.

If expense payment methods are tracked, report them separately from sales payment totals. Do not confuse expense payments with sales revenue.

The accounting day starts and ends at midnight in Asia/Dhaka.

## 11. DASHBOARD

Include these widgets:
- Today's Sales
- Gross Profit
- Expenses & Net Profit
- Payment Breakdown
- Low Stock Warning
- Recent Sales

Use Recharts for clear, compact charts where useful.

Use real database data for production screens. Show proper empty states when data is unavailable.

Do not display fabricated production statistics.

## 12. REPORTS

Provide:
- Today
- Custom Date Range

Support sales, gross profit, expenses, net profit, and payment-method breakdowns.

Use Asia/Dhaka day boundaries. Avoid UTC/local-time bugs and off-by-one date errors.

Cancelled sales must not be included in active sales totals.

Edited sales must be reflected correctly in reports.

## 13. CSV IMPORT AND EXPORT

Support CSV import/export for authorized medicine and stock operations.

Requirements:
- UTF-8 support, including Bangla text
- Correct CSV escaping
- Explicit column schema
- Validation and duplicate detection
- Preview before committing imports
- Row-level error reporting
- Permission checks

Clearly explain what each export contains.

Do not claim that medicine CSV export is a complete backup of all sales, expenses, users, and audit logs.

## 14. SETTINGS

Provide minimal settings for:
- Pharmacy display name
- Receipt information
- Profile basics
- Necessary application preferences

Authorized Admins can approve or disable employees and assign individual permissions and discount limits.

Super Admin can manage privileged account access.

Protect all sensitive operations with server-side authorization and confirmation where appropriate.

## 15. SECURITY AND ENVIRONMENT

Provide a safe .env.example containing placeholders only.

Required configuration may include:
- MONGODB_URI
- MONGODB_DB_NAME
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- FIREBASE_ADMIN_PROJECT_ID
- FIREBASE_ADMIN_CLIENT_EMAIL
- FIREBASE_ADMIN_PRIVATE_KEY
- SUPERADMIN_BOOTSTRAP_SECRET, only if needed for one-time provisioning

Never expose MONGODB_URI or Firebase Admin credentials through NEXT_PUBLIC variables.

Add .env.local and secret files to .gitignore.

Do not generate or commit real credentials.

Document Firebase Console setup, MongoDB Atlas configuration, local environment setup, initial Super Admin provisioning, and Vercel environment configuration.

Use safe error messages without exposing secrets or internal stack traces.

## 16. TESTING AND DELIVERY

Implement the complete application in this build run.

Run the available:
- Lint checks
- TypeScript checks
- Unit tests
- Production build

Add tests for critical calculations and authorization where practical:
- Weighted average cost
- Unit conversion
- Fixed and percentage discounts
- Employee discount limits
- Gross and net profit
- Asia/Dhaka date boundaries
- Permission enforcement
- Stock availability and concurrent updates

Verify:
- Employee registration and pending status
- Admin approval and permission assignment
- Protected API endpoints
- Duplicate medicine prevention
- Stock addition and weighted average cost
- Configured unit conversion and per-unit prices
- Low-stock dashboard warning and toast
- POS sale and stock decrement
- Insufficient-stock rejection
- Discount-limit enforcement
- Receipt print layout
- Sale edit/cancel and stock reversal
- Audit history
- Daily accounts and expenses
- Custom date-range reports
- CSV import/export
- Responsive mobile and tablet layouts
- Production build

Do not fabricate successful tests or deployment results.

If Firebase or MongoDB credentials are unavailable, still test pure business logic and build checks, then clearly list the integration steps that remain.

Finish with a concise report containing:
1. Implemented features
2. Files and architecture created
3. Checks actually run and their results
4. Environment variables required
5. Manual Firebase, MongoDB, and Vercel setup steps
6. Known limitations

Do not ask further scope questions. Use secure, minimal defaults for unspecified details and proceed with implementation.
