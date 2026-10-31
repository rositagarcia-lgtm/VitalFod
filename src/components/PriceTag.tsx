import { formatPrice } from "@/lib/images";
import { cn } from "@/lib/utils";

/** Precio en soles. Con oferta, el precio anterior aparece tachado junto al precio real. */
export function PriceTag({
  precio,
  oferta,
  className,
}: {
  precio: number;
  oferta: number | null;
  className?: string;
}) {
  if (oferta === null) {
    return <p className={cn("font-extrabold text-brand-wine", className)}>{formatPrice(precio)}</p>;
  }
  return (
    <p className={cn("flex flex-wrap items-baseline justify-end gap-x-2", className)}>
      <span className="font-extrabold text-brand-wine">
        <span className="sr-only">Precio de oferta: </span>
        {formatPrice(oferta)}
      </span>
      <s className="text-sm font-semibold text-muted-foreground">
        <span className="sr-only">Precio anterior: </span>
        {formatPrice(precio)}
      </s>
    </p>
  );
}
