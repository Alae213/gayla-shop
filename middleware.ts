import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
  localePrefix: "as-needed",
});

export const config = {
  matcher: ["/", "/(ar|fr|en)/:path*", "/((?!_next|_vercel|.*\\..*).*)"],
};
