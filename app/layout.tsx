import type { Metadata } from "next";
import { Provider } from "@/components/Provider";
import { Shell } from "@/components/Shell";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "CASEFILE — Investigation Bureau",
    template: "%s · CASEFILE",
  },
  description:
    "Enter the scene. Follow the evidence. Uncover the truth. An immersive mystery investigation game.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <Provider>
          <Shell>{children}</Shell>
        </Provider>
      </body>
    </html>
  );
}
