import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Iniciar sesión · Arcade Vault",
};

export default function AuthPage() {
  return <AuthForm />;
}
