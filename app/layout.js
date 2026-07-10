import "./globals.css";

export const metadata = {
  title: "Perpustakaan",
  description: "Perpustakaan Digital",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-red-500">{children}</body>
    </html>
  );
}
