"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { SignupSchema, type SignupForm } from "./component/signup.schema";

export default function Signup() {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { username: "", email: "", password: "" },
    mode: "onSubmit",
  });

  const [showPassword, setShowPassword] = useState(false);
  const toggleShow = () => setShowPassword((p) => !p);

  // استایل‌های پایه
  const borderBase = "border border-stone-500 dark:border-stone-600";
  const focusRing =
    "focus-visible:ring-2 focus-visible:ring-stone-500 dark:focus-visible:ring-stone-200  dark:focus-visible:ring-stone-300 focus-visible:outline-none";
  const baseInputClass = `h-10 ${borderBase} ${focusRing} text-stone-500 dark:text-stone-200 placeholder:text-stone-500 dark:placeholder:text-stone-200 placeholder:pb-3`;
  const errorClass = "border-red-500 focus-visible:ring-red-500 dark:focus-visible:ring-red-800";

  const onSubmit = (data: SignupForm) => {
    // اینجا درخواست API خودتان را بزنید
    console.log("Signup payload:", data);

    toast(t("signup.toast.success"), {
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    });

    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      dir={dir}
      className={dir === "rtl" ? "text-right" : "text-left"}
      noValidate
    >
      {/* Username */}
      <div className="mb-4 ">
        <Label htmlFor="signup-username" className="mb-2 block text-stone-700 dark:text-stone-200">
          {t("signup.fields.username")}
        </Label>
        <Input
          id="signup-username"
          {...register("username")}
          autoComplete="username"
          placeholder={t("signup.placeholders.username") || ""}
          className={`${baseInputClass} ${errors.username ? errorClass : ""}`}
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? "signup-username-err" : undefined}
        />
        {errors.username && (
          <p
            id="signup-username-err"
            role="alert"
            className="text-xs text-red-600 mt-1"
          >
            {t(errors.username.message as string)}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <Label htmlFor="signup-email" className="mb-2 block text-stone-700 dark:text-stone-200">
          {t("signup.fields.email")}
        </Label>
        <Input
          id="signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          {...register("email")}
          placeholder={t("signup.placeholders.email") || ""}
          className={`${baseInputClass} ${errors.email ? errorClass : ""}`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "signup-email-err" : undefined}
        />
        {errors.email && (
          <p
            id="signup-email-err"
            role="alert"
            className="text-xs text-red-600 mt-1"
          >
            {t(errors.email.message as string)}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-6">
        <Label htmlFor="signup-password" className="mb-2 block text-stone-700 dark:text-stone-200">
          {t("signup.fields.password")}
        </Label>

        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            {...register("password")}
            placeholder={t("signup.placeholders.password") || ""}
            className={`${baseInputClass} ${
              dir === "rtl" ? "pl-10 pr-3" : "pr-10 pl-3"
            } ${errors.password ? errorClass : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "signup-password-err" : undefined
            }
          />

          <button
            type="button"
            onClick={toggleShow}
            className={`absolute inset-y-0 flex items-center ${
              dir === "rtl" ? "left-2" : "right-2"
            } text-stone-500 hover:text-stone-700 `}
            tabIndex={-1}
            aria-label={
              showPassword ? t("signup.actions.hide") : t("signup.actions.show")
            }
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {errors.password && (
          <p
            id="signup-password-err"
            role="alert"
            className="text-xs text-red-600 mt-1"
          >
            {t(errors.password.message as string)}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-stone-600 dark:text-stone-200  dark:text-stone-200">
        {t("signup.actions.submit")}
      </Button>
    </form>
  );
}
