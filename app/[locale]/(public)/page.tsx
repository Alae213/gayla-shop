import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  // Await params
  const { locale } = await Promise.resolve(params);
  setRequestLocale(locale);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/10 to-background">
        <div className="container">
          <div className="flex flex-col items-center text-center space-y-8">
            <HeroContent locale={locale} />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex flex-col space-y-8">
            <div className="flex items-center justify-between">
              <FeaturedSection locale={locale} />
            </div>

            {/* Placeholder for products */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ProductCardPlaceholder />
              <ProductCardPlaceholder />
              <ProductCardPlaceholder />
              <ProductCardPlaceholder />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Server Components for translations
function HeroContent({ locale }: { locale: string }) {
  const t = useTranslations("home.hero");
  return (
    <>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        {t("title")}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        {t("subtitle")}
      </p>
      <Link href={`/${locale}/products`}>
        <Button size="lg" className="gap-2">
          {t("cta")}
          <ArrowRight className="h-5 w-5" />
        </Button>
      </Link>
    </>
  );
}

function FeaturedSection({ locale }: { locale: string }) {
  const t = useTranslations();
  return (
    <>
      <h2 className="text-3xl font-bold">{t("home.featured")}</h2>
      <Link href={`/${locale}/products`}>
        <Button variant="outline">{t("common.viewAll")}</Button>
      </Link>
    </>
  );
}

function ProductCardPlaceholder() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-muted" />
      <CardContent className="p-4">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" variant="outline">
          <div className="h-4 bg-muted rounded w-20" />
        </Button>
      </CardFooter>
    </Card>
  );
}
