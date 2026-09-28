import heroImage from "@/assets/vital-foods-hero.jpg";
import dishesImage from "@/assets/vital-foods-dishes.jpg";
import aboutImage from "@/assets/vital-foods-about.jpg";

export const dishCategories = ["Todos", "Desayunos", "Almuerzos", "Bowls", "Ensaladas", "Snacks", "Bebidas"] as const;
export type DishCategory = Exclude<(typeof dishCategories)[number], "Todos">;
export type Dish = { name: string; category: DishCategory; description: string; price: string; image: string; position: string };

export const dishes: Dish[] = [
  { name: "Bowl Vital", category: "Bowls", description: "Pollo grillado, quinua, palta, mix de hojas y vegetales frescos.", price: "S/ 24.90", image: heroImage, position: "72% center" },
  { name: "Tostadas tropicales", category: "Desayunos", description: "Tostadas integrales, frutas de estación, granola y palta cremosa.", price: "S/ 18.90", image: dishesImage, position: "35% 66%" },
  { name: "Ensalada Mediterránea", category: "Ensaladas", description: "Hojas verdes, tomate, pepino, granos y aliño cítrico de la casa.", price: "S/ 22.90", image: aboutImage, position: "center 72%" },
  { name: "Yogurt & berries", category: "Snacks", description: "Yogurt natural, frutos rojos, granola crocante y miel.", price: "S/ 14.90", image: dishesImage, position: "17% 48%" },
  { name: "Green power", category: "Bebidas", description: "Piña, espinaca, manzana y un toque fresco de limón.", price: "S/ 11.90", image: heroImage, position: "70% 12%" },
  { name: "Pollo garden", category: "Almuerzos", description: "Pechuga grillada con vegetales, palta y cereales integrales.", price: "S/ 26.90", image: heroImage, position: "70% 62%" },
];