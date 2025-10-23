The following CSS variables were removed from `src/app/globals.css` on user request (clean up unused gradient/wordmark tokens):

- --title-gradient-light
- --title-fallback-light
- --title-stop-1 (light)
- --title-stop-2 (light)
- --title-stop-3 (light)
- --title-gradient-dark
- --title-fallback-dark
- --title-stop-1 (dark)
- --title-stop-2 (dark)
- --title-stop-3 (dark)
- --wordmark-bg (light/dark)
- --wordmark-border (light/dark)

Reason: project's current design uses fixed title colors (`--title-solid-light` / `--title-solid-dark`) and the gradient tokens were unused and causing cascade complexity.

If you want to restore them, check the git history or this file and we can re-add them.
