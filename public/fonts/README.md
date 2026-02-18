# Fonts

This project expects local font files referenced by `app/globals.css`:

- `SF-Pro-Rounded-Medium.otf`
- `SF-Pro-Rounded-Heavy.otf`
- `ScheherazadeNew-Regular.ttf`
- `ScheherazadeNew-SemiBold.ttf`

Place the real font files in this folder at build time.

Important:
- Do not commit proprietary font binaries to the repository.
- In production, ensure your deployment includes these files or update the `@font-face` paths.
