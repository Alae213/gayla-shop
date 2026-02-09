import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'fr'
});

export default intlMiddleware;

export const config = {
  matcher: ['/', '/(ar|fr|en)/:path*']
};
