import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/shared/Navbar";
import Sidebar from "@/components/shared/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

const interHeading = Inter({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Employee Leave Management System",
  description: "Manage employee records and leave requests",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interHeading.variable} font-sans antialiased`}>
        <AuthProvider>
          <Navbar />
          <Sidebar />
          <main className="container mx-auto px-4 py-6 md:px-6 md:py-8 mt-14 md:mt-0">
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
