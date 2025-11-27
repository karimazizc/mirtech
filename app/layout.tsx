import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const raleway = localFont({
  src: [
    {
      path: "./Raleway/static/Raleway-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./Raleway/static/Raleway-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-raleway",
});

export const metadata: Metadata = {
  title: "Mirtech Dashboard",
  description: "Karim's Assignment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
