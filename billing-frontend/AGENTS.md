<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Form Architecture Rules
- Always Talk Short, Explain Short. Be Punctual and Quick to Respond and do not Repeat Yourself.
- All form components MUST be created inside a dedicated `components/forms/` directory.
- For feature-specific forms, place them under `src/features/<feature-name>/components/forms/<form-name>.tsx`.
- For global reusable forms, place them under `src/components/forms/<form-name>.tsx`.
- Next.js page components in `src/app/` must stay thin and delegate form rendering to these form components.
- Always prefer and use ShadCn; components for most avaliable in the library. For reference of all Shadcns components refeer the website link https://ui.shadcn.com/docs/components
- Always where there is a form which is used to create new records ALWAYS provide two 3 buttons "Cancel" to go back to list page, "Save" to save the form and "Save & Create New" to save the form and create a new record.
- Always use "loading" state and "disable effects" for buttons and disable the button when clicked on it for that action.
- Always prefer a Shimmer or Skeleton effect before loading a page or record which are being fetched using api or web socket
- Always Use "toast" to display success, error or warning messages.
