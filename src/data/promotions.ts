import vitalWeekImage from "@/assets/campaign-vital-week-eco.jpg";
import vitalWeekPracticalityImage from "@/assets/campaign-vital-week-practicality-eco.jpg";
import vitalWeekOrganizationImage from "@/assets/campaign-vital-week-organization-eco.jpg";

export type Promotion = {
  eyebrow: string;
  sticker?: string;
  title: string;
  description: string;
  secondaryDescription?: string;
  cta: string;
  image: string;
  imagePosition: string;
  variant: "launch" | "practicality" | "organization";
  features: string[];
};

export const promotions: Promotion[] = [
  {
    eyebrow: "Nuevo",
    title: "VITAL WEEK",
    description: "Tu alimentación saludable, lista cuando la necesitas.",
    secondaryDescription: "Comidas saludables preparadas y refrigeradas para ayudarte a organizar mejor tu alimentación.",
    cta: "Conoce Vital Week",
    image: vitalWeekImage,
    imagePosition: "center",
    variant: "launch",
    features: ["Preparado", "Refrigerado", "Listo para calentar"],
    sticker: "NUEVO",
  },
  {
    eyebrow: "Vital Week",
    title: "Menos tiempo en la cocina. Más tiempo para ti.",
    description: "Ten tus comidas preparadas y refrigeradas para disfrutarlas cuando las necesites.",
    cta: "Descubre cómo funciona",
    image: vitalWeekPracticalityImage,
    imagePosition: "center",
    variant: "practicality",
    features: ["Guarda", "Calienta", "Disfruta"],
  },
  {
    eyebrow: "Tu rutina, más fácil",
    title: "Organiza tus comidas con Vital Week",
    description: "Una alternativa práctica para quienes estudian, trabajan o entrenan y quieren mantener una alimentación saludable.",
    cta: "Descubre Vital Week",
    image: vitalWeekOrganizationImage,
    imagePosition: "center",
    variant: "organization",
    features: ["Saludable", "Práctico", "Refrigerado", "Delivery"],
  },
];
