import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PromoBanner } from "@/components/PromoBanner";
import { FeaturedSection } from "@/components/FeaturedSection";
import { AboutSection } from "@/components/AboutSection";
import { LocationsSection } from "@/components/LocationsSection";
import { getHomeData } from "@/functions/public";

export const Route = createFileRoute("/")({
  loader: () => getHomeData(),
  head: () => ({
    meta: [
      { title: "Vital Foods | Comida saludable en Trujillo" },
      {
        name: "description",
        content:
          "Descubre bowls, desayunos, ensaladas y más opciones frescas en las sedes de Vital Foods.",
      },
      { property: "og:title", content: "Vital Foods | Disfruta lo saludable" },
      {
        property: "og:description",
        content: "Sabores frescos y nutritivos preparados para sentirte bien.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { destacados, totalPlatillos, sedes, promociones } = Route.useLoaderData();

  return (
    <SiteLayout>
      <PromoBanner promotions={promociones} />
      <FeaturedSection dishes={destacados} total={totalPlatillos} />
      <AboutSection />
      <LocationsSection locations={sedes} />
    </SiteLayout>
  );
}
