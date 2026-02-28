---
description: Custom project rules and guidelines
---
# Antigravity Custom Rules

1. **Docker Execution**: Do NOT automatically run `docker compose build` or `docker compose up`. Assume the application environment is already running.
2. **Version Control**: Do NOT run `git commit`, `git push`, or any version control mutations without explicit instruction. 
3. **Design Principles**: Always take a **mobile-first approach** when creating or updating UI components.
4. **Code Architecture**: strictly adhere to **SOLID principles** (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion).
5. **Autonomy Limits**: Do not modify files outside the direct scope of the user's request.
6. **Destructive Actions**: Do not delete configurations or sample data files arbitrarily.
7. **Package Managers**: DO NOT run npm commands (`npm run build`, `npm install`, etc) manually. The application runs through Docker, so rely on the `docker compose` containers to handle dependencies and builds.
