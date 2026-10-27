import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createUploadSignature } from "@/server/cloudinary";
import { requireUser } from "@/server/session";
import { validate } from "@/server/validation";

export const getUploadSignature = createServerFn({ method: "POST" })
  .validator(validate(z.object({ carpeta: z.enum(["platillos", "promociones"]) })))
  .handler(async ({ data }) => {
    await requireUser();
    return createUploadSignature(data.carpeta);
  });
