import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Login or create an account to access your financial dashboard.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      {children}
    </main>
  );
}
