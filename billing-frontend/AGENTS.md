<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Form Architecture Rules
- All form components MUST be created inside a dedicated `components/forms/` directory.
- For feature-specific forms, place them under `src/features/<feature-name>/components/forms/<form-name>.tsx`.
- For global reusable forms, place them under `src/components/forms/<form-name>.tsx`.
- Next.js page components in `src/app/` must stay thin and delegate form rendering to these form components.

