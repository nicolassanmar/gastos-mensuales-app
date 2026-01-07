import "~/styles/globals.css";
import { Inter } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import { Navbar } from "~/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Monitor de gastos",
  description: "Aplicación para monitorear tus gastos",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-700`}
      >
        <div className="container mx-auto px-4 py-8">
          <Providers>
            <Navbar />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
