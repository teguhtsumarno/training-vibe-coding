"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/validators/login-validator";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import { ArrowRight, KeyRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { login, isAuthenticated, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isLoading, isAuthenticated, router]);

  const onSubmit = async (data: LoginFormValues) => {
    setError("");
    const success = await login(data.username, data.password);
    if (success) {
      toast.success("Login successful!");
      router.replace(ROUTES.DASHBOARD);
    } else {
      setError("Invalid username or password");
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white -mt-14 md:-mt-8 px-4">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[400px] -right-[300px] w-[800px] h-[800px] rounded-full bg-[rgba(50,121,249,0.03)]" />
        <div className="absolute -bottom-[300px] -left-[200px] w-[600px] h-[600px] rounded-full bg-[rgba(239,242,247,0.8)]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#121317] mb-5">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-[28px] font-heading font-medium text-[#121317] tracking-tight">
            Welcome back
          </h1>
          <p className="text-[14.5px] text-[#6A6A71] mt-2">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-[#E1E6EC] rounded-[16px] p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[14.5px] font-medium text-[#121317]">
                Username
              </Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...register("username")}
                className="h-11 bg-white border-[#E1E6EC] rounded-lg px-3.5 text-[16px] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200"
              />
              {errors.username && (
                <p className="text-[14.5px] text-[#FF0000]">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[14.5px] font-medium text-[#121317]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className="h-11 bg-white border-[#E1E6EC] rounded-lg px-3.5 text-[16px] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200"
              />
              {errors.password && (
                <p className="text-[14.5px] text-[#FF0000]">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#FF0000] bg-[rgba(255,0,0,0.02)] px-4 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FF0000] shrink-0" />
                <p className="text-[14.5px] text-[#FF0000]">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="w-full h-11 mt-1 cursor-pointer group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[14.5px] text-[#6A6A71] mt-8">
          Employee Leave Management System
        </p>
      </div>
    </div>
  );
}
