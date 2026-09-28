import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { PromoBanner } from "@/components/PromoBanner";
import { DishesSection } from "@/components/DishesSection";
import { AboutSection } from "@/components/AboutSection";
import { LocationsSection } from "@/components/LocationsSection";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vital Foods | Comida saludable en Trujillo" },
      { name: "description", content: "Descubre bowls, desayunos, ensaladas y más opciones frescas en las sedes de Vital Foods." },
      { property: "og:title", content: "Vital Foods | Disfruta lo saludable" },
      { property: "og:description", content: "Sabores frescos y nutritivos preparados para sentirte bien." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <main>
        <PromoBanner />
        <DishesSection />
        <AboutSection />
        <LocationsSection />
      </main>
      <Footer />
    </div>
  );
}