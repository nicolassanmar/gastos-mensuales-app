import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Monitor de gastos",
  description: "Aplicación para monitorear tus gastos",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500`}
      >
        <div className="container mx-auto px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
