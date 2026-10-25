
# Pharmacy Management App — Antigravity Setup

## Included Files
- MASTER_PROMPT.md — primary full-app build prompt
- AGENTS.md — persistent project-wide rules
- .agents/skills/ — six focused skill files
- .env.example — environment-variable placeholders

## Setup
1. Create a clean Next.js App Router project or use an existing clean starter.
2. Save AGENTS.md and MASTER_PROMPT.md at the repository root.
3. Save the six skill files inside their named folders under .agents/skills/.
4. Open the project in Antigravity.
5. Paste MASTER_PROMPT.md into the Agent and ask it to execute the full build.
6. Configure Firebase Authentication and MongoDB Atlas.
7. Add environment variables locally and in Vercel.
8. Run checks and verify the application before deployment.

## Boilerplate Recommendation
Prefer the official Next.js starter over random third-party boilerplates.

Official guide:
https://nextjs.org/docs/app/getting-started/installation

Antigravity documentation:
https://antigravity.google/docs/rules/
https://antigravity.google/docs/skills/

## Security
Never commit real credentials, .env.local, Firebase service-account JSON, or bootstrap secrets.
