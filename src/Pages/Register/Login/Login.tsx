"use client";

import  { useState, type JSX, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { LoginSchema, type LoginForm } from "./login.schema";

function Login(): JSX.Element {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const [showPassword, setShowPassword] = useState(false);
  const toggleShow = () => setShowPassword((p) => !p);

  // استایل‌های پایه هماهنگ با پروژه
  const borderBase = "border border-stone-500 dark:border-stone-600";
  const focusRing =
    "focus-visible:ring-2 focus-visible:ring-stone-500 dark:focus-visible:ring-stone-300 focus-visible:outline-none";
  const baseInputClass = `h-10 ${borderBase} ${focusRing} text-stone-500 placeholder:text-stone-500 placeholder:pb-3 `;
  const errorClass = "border-red-500 focus-visible:ring-red-500";

  const onSubmit = useCallback(
    (data: LoginForm) => {
      console.log("Login payload:", data);
      // اینجا درخواست API لاگین خودت رو بزن

      // ✅ توست موفقیت
      toast(t("login.toast.success"), {
        icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      });
    },
    [t]
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      dir={dir}
      className={dir === "rtl" ? "text-right" : "text-left"}
      noValidate
    >
      {/* Email */}
      <div className="mb-4">
        <Label htmlFor="login-email" className="mb-2 block text-stone-700">
          {t("login.fields.email")}
        </Label>
        <Input
          id="login-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t("login.placeholders.email") || ""}
          {...register("email")}
          className={`${baseInputClass} ${errors.email ? errorClass : ""}`}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "login-email-err" : undefined}
        />
        {errors.email && (
          <p
            id="login-email-err"
            role="alert"
            className="text-xs text-red-600 mt-1"
          >
            {t(errors.email.message as string)}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="mb-6">
        <Label htmlFor="login-password" className="mb-2 block text-stone-700">
          {t("login.fields.password")}
        </Label>

        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder={t("login.placeholders.password") || ""}
            {...register("password")}
            className={`${baseInputClass} ${
              dir === "rtl" ? "pl-10 pr-3" : "pr-10 pl-3"
            } ${errors.password ? errorClass : ""}`}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "login-password-err" : undefined
            }
          />

          <button
            type="button"
            onClick={toggleShow}
            className={`absolute inset-y-0 flex items-center ${
              dir === "rtl" ? "left-2" : "right-2"
            } text-stone-500 hover:text-stone-700`}
            tabIndex={-1}
            aria-label={
              showPassword ? t("login.actions.hide") : t("login.actions.show")
            }
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {errors.password && (
          <p
            id="login-password-err"
            role="alert"
            className="text-xs text-red-600 mt-1"
          >
            {t(errors.password.message as string)}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full bg-stone-600 font-medium ">
        {t("login.actions.submit")}
      </Button>
    </form>
  );
}

export default Login;
