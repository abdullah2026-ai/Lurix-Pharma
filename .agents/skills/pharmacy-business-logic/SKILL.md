
---
name: pharmacy-business-logic
description: Implement pharmacy inventory units, per-unit pricing, weighted average cost, POS discounts, receipts, and daily accounting.
---

# Pharmacy Business Logic Skill

- Use BDT and Asia/Dhaka accounting-day boundaries.
- Each medicine has a base stock unit and optional configured sale-unit conversions.
- Convert sold quantities into base units before stock validation and deduction.
- Keep explicit selling prices for configured sale units.
- Do not assume selling prices must be exact multiples of the base-unit price.
- When stock is added, calculate weighted average cost using quantities and costs normalized to the same base unit.
- Handle zero stock safely.
- Snapshot historical selling prices and costs on each sale.
- Net sales = subtotal minus discount.
- COGS = sold base quantity multiplied by historical base-unit cost.
- Gross profit = net sales minus COGS.
- Net profit = gross profit minus expenses.
- Enforce each employee's discount cap on the server.
- Sale edit/cancel must reverse old stock effects and apply corrected effects consistently.
- Record every important change in an append-only audit log.
- Payment methods are Cash, bKash, and Nagad.
- Do not collect customer details.
- Default low-stock threshold is 10 base units.
- Show low-stock dashboard warnings and toast notifications.
- Never treat sales revenue as profit.
- Never rewrite historical profit using current medicine costs.
