import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SDC INDIA | Student Developers Community",
  description:
    "SDC INDIA is a student-led developer community founded in 2022 at SNIST. Bridging academic learning and industry through hackathons, workshops, and real-world projects.",
  openGraph: {
    title: "SDC INDIA — Student Developers Community",
    description:
      "Founded in 2022 at SNIST. 2500+ members, 50+ events, 120+ workshops.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
