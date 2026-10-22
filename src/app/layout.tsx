import type { Metadata, Viewport } from "next";

import "@fontsource-variable/unbounded";
import "@fontsource-variable/onest";
import "./globals.css";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Форма роста — трекер тренировок",
  description:
    "Журнал тренировок, прогресс, очки и рейтинг. Конкурсное задание «Профессионалы 2026», компетенция «Веб-технологии».",
};

export const viewport: Viewport = {
  themeColor: "#0a0c0b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster
          position="top-center"
          theme="dark"
          toastOptions={{
            style: {
              background: "#182019",
              border: "1px solid rgb(255 255 255 / 0.1)",
              color: "#f2f5f1",
              borderRadius: 14,
            },
          }}
        />
      </body>
    </html>
  );
}
