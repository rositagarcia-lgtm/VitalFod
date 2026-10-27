import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { DishesSection } from "@/components/DishesSection";
import { AboutSection } from "@/components/AboutSection";
import { LocationsSection } from "@/components/LocationsSection";
import { Footer } from "@/components/Footer";
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
  const { platillos, categorias, sedes, promociones } = Route.useLoaderData();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <main>
        <PromoBanner promotions={promociones} />
        <DishesSection dishes={platillos} categories={categorias} />
        <AboutSection />
        <LocationsSection locations={sedes} />
      </main>
      <Footer />
    </div>
  );
}
