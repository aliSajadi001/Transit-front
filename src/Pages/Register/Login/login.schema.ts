// src/validation/login.schema.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "login.errors.emailRequired" })
    .email({ message: "login.errors.emailInvalid" }),
  password: z
    .string()
    .min(1, { message: "login.errors.passwordRequired" })
    .min(8, { message: "login.errors.passwordMin" }),
});

export type LoginForm = z.infer<typeof LoginSchema>;
