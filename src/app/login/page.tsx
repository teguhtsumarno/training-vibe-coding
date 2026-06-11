"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/validators/login-validator";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";

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
    <div className="flex items-center justify-center min-h-[85vh] -mt-14 md:-mt-8 px-4">
      <Card className="w-full max-w-md bg-[#09090b] border border-white/5 rounded-2xl shadow-2xl shadow-blue-500/5 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" />
        <CardHeader className="text-center pt-8 pb-4">
          <CardTitle className="text-3xl font-heading font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
            LeaveManager
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs mt-1.5 font-medium">
            Enter your admin credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-white tracking-wide">Username</Label>
              <Input
                id="username"
                placeholder="Enter username"
                {...register("username")}
                className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
              />
              {errors.username && (
                <p className="text-xs font-medium text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-white tracking-wide">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                {...register("password")}
                className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
              />
              {errors.password && (
                <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-xs font-medium text-red-500 text-center">{error}</p>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl shadow-md shadow-red-500/20 py-2.5 font-semibold transition-all duration-300 border-0 mt-2 cursor-pointer" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
