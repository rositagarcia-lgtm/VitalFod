import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toInt(value: string, fallback = 0): number {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? fallback : n;
}
