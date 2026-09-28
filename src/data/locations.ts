export type Location = { name: string; address: string; hours: string; reference: string; mapUrl: string };

export const locations: Location[] = [
  { name: "Centro", address: "Jr. Bolognesi 502, Centro", hours: "Lun – Sáb · 8:00 a.m. – 9:00 p.m.", reference: "A media cuadra de la Plaza de Armas", mapUrl: "https://maps.google.com/?q=Jr.+Bolognesi+502+Trujillo" },
  { name: "La Merced", address: "Díaz de Cienfuegos 287, La Merced", hours: "Lun – Sáb · 8:00 a.m. – 9:00 p.m.", reference: "Zona La Merced", mapUrl: "https://maps.google.com/?q=Diaz+de+Cienfuegos+287+Trujillo" },
  { name: "UPAO", address: "UPAO", hours: "Lun – Vie · 8:00 a.m. – 8:00 p.m.", reference: "Campus universitario", mapUrl: "https://maps.google.com/?q=UPAO+Trujillo" },
  { name: "El Golf", address: "Av. El Golf 152", hours: "Lun – Dom · 8:00 a.m. – 9:00 p.m.", reference: "Urbanización El Golf", mapUrl: "https://maps.google.com/?q=Av.+El+Golf+152+Trujillo" },
  { name: "MIC", address: "MIC", hours: "Lun – Sáb · 9:00 a.m. – 8:00 p.m.", reference: "Módulo Vital Foods", mapUrl: "https://maps.google.com/?q=MIC+Trujillo" },
];