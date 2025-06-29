import type { Metadata } from "next";
import config from "@/config";
import "./globals.css";
import { GoogleTagManager } from '@next/third-parties/google'
import { OpenPanelComponent } from '@openpanel/nextjs';
import { SessionProvider } from "next-auth/react"
import { Toaster } from 'react-hot-toast';
import { EnhancedToaster } from "@/components/ui/enhanced-toaster";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import FooterWrapper from "@/components/ui/FooterWrapper";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppProvider } from "@/context/AppContext";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { PerformanceMonitor, ResourceHints } from "@/components/ui/LazyComponents";
import { PerformanceTrigger } from "@/components/dev/PerformanceDashboard";

export const metadata: Metadata = config.metadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <ThemeProvider defaultTheme="system" storageKey="solid-bsv-theme">
          <AppProvider>
            <ErrorBoundary>
              <PerformanceMonitor>
                <body
                  className="antialiased min-h-screen flex flex-col"
                >
                  <ResourceHints />
                  <OfflineBanner />
                  <Toaster position="top-center" />
                  <EnhancedToaster />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <FooterWrapper />
                  <PerformanceTrigger />
                </body>
              </PerformanceMonitor>
            </ErrorBoundary>
          </AppProvider>
        </ThemeProvider>
      </SessionProvider>
      {/* Google Tag Manager */}
      {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
      )}
      
      {/* OpenPanel Analytics */}
      {process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID && (
        <OpenPanelComponent
          clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID}
          trackScreenViews={true}
          // trackAttributes={true}
          // trackOutgoingLinks={true}
          // If you have a user id, you can pass it here to identify the user
          // profileId={'123'}
        />
      )}
    </html>
  );
}
