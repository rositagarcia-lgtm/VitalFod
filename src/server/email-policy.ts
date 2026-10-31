/**
 * Dominios de correo permitidos para las cuentas del panel (correos homologados).
 * Se configura con ADMIN_EMAIL_DOMAINS, separados por comas. Por defecto: gmail.com y vitalfoods.pe.
 */
export function allowedEmailDomains(): string[] {
  return (process.env["ADMIN_EMAIL_DOMAINS"] || "gmail.com,vitalfoods.pe")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

export function assertAllowedEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const allowed = allowedEmailDomains();
  if (!allowed.includes(domain)) {
    throw new Error(`Solo se permiten correos de: ${allowed.map((d) => "@" + d).join(", ")}.`);
  }
}
