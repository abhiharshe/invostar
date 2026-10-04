---
name: theme-color
description: Apply the following theme & colors to the application.
---

# Theme-Color

Use the tailwind colors for all the components, pages & UI elements. Do not use any other color.

## When to use this skill

- Use this when you need to change the color of any component, page or UI element.
- Do not use any other color than the tailwind colors.
- Use semantic colors from tailwind config.
- Always consider tailwindcss **Neutral** colors palette for text & background colors.
- For components created using **Shadcn UI** use the semantic colors for Background, Card, Button, Input, Typography, Popover, DropdownMenu, etc. This will also be applied for all html elements like div, p, span, h1, h2, h3, h4, h5, h6, a, button, input, select, textarea, etc.
- Border colors should always be with **Neutral** colors palette.
- For all components always use light & dark theme class derivatives. Example: .bg-card, .dark:bg-card, .bg-primary, .dark:bg-primary, etc.
- Don't use any other border radius class except `rounded-none` for all components.


## How to use it

If you need to change the color of any component, page or UI element, use the tailwind colors. Make sure the color is in the theme colors. Use semantic colors. Always follow the tailwind color naming convention. It's better to use .bg-primary instead of .bg-blue-500. For more details checkout the documentation at the following url:

[Tailwidn Colors](https://tailwindcss.com/docs/colors)
