import { getRequestConfig, GetRequestConfigParams, RequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["ar", "fr", "en"] as const;
export const defaultLocale = "fr" as const;

export default getRequestConfig(async ({ locale }: GetRequestConfigParams): Promise<RequestConfig> => {
  if (!locales.includes(locale as "ar" | "fr" | "en")) notFound();

  return {
    locale: locale as "ar" | "fr" | "en",
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
