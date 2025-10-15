import { SettingsProvider } from "./contexts/SettingsContext";
import { TransactionProvider } from "./contexts/TransactionContext";
import { BudgetProvider } from "./contexts/BudgetContext";
import { BudgetTransactionSync } from "./contexts/BudgetTransactionSync";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";
import { Inter, Pacifico } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeWrapper from "../app/ThemeWrapper";
import { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Smart Budget",
  description: "Your personal finance management dashboard",
};

const pacifico = Pacifico({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pacifico',
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{
            const s=localStorage.getItem('appearance');
            const theme = s ? JSON.parse(s).theme : 'auto';
            const dark = theme==='dark' || (theme==='auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', dark);
          }catch(e){}`}
        </Script>
      </head>
      <body className={`${inter.variable} ${pacifico.variable} antialiased`}>
        <AuthProvider>
          <SettingsProvider>
            <NotificationProvider>
              <BudgetProvider>
                <TransactionProvider>
                  <BudgetTransactionSync>
                    <ThemeWrapper>
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          className: 'bg-gray-900 text-white border border-gray-800 shadow-lg',
                          style: { borderRadius: '0.75rem' },
                          success: { iconTheme: { primary: '#10B981', secondary: '#ffffff' } },
                          error: { iconTheme: { primary: '#EF4444', secondary: '#ffffff' } }
                        }}
                      />
                      {children}
                    </ThemeWrapper>
                  </BudgetTransactionSync>
                </TransactionProvider>
              </BudgetProvider>
            </NotificationProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}