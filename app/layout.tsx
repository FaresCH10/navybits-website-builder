import "./globals.css";

export const metadata = {
  title: "NavyBits Website Builder",
  description:
    "Welcome to NavyBits Website Builder — visual editing, AI-assisted drafts, and your own projects in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
