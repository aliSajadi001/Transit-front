// src/validation/signup.schema.ts
import { z } from "zod";

export const SignupSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, { message: "signup.errors.usernameRequired" })
    .min(3, { message: "signup.errors.usernameMin" })
    .max(32, { message: "signup.errors.usernameMax" })
    .regex(/^[a-zA-Z0-9._-]+$/, {
      message: "signup.errors.usernameFormat",
    }),
  email: z
    .string()
    .trim()
    .min(1, { message: "signup.errors.emailRequired" })
    .email({ message: "signup.errors.emailInvalid" }),
  password: z
    .string()
    .min(1, { message: "signup.errors.passwordRequired" })
    .min(8, { message: "signup.errors.passwordMin" })
    .regex(/[A-Za-z]/, { message: "signup.errors.passwordLetter" })
    .regex(/\d/, { message: "signup.errors.passwordNumber" }),
});

export type SignupForm = z.infer<typeof SignupSchema>;
