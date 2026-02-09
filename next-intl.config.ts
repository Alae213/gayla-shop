import { getRequestConfig, RequestConfig } from 'next-intl/server';

const defaultLocale = 'fr';
const locales = ['ar', 'fr', 'en'] as const;

export default getRequestConfig(async ({ locale }): Promise<RequestConfig> => {
  const resolvedLocale =
    locale && locales.includes(locale as (typeof locales)[number])
      ? locale
      : defaultLocale;
  return {
    locale: resolvedLocale,
    messages: (await import(`./messages/${resolvedLocale}.json`)).default,
  };
});
