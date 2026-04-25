export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t py-3 text-center text-xs text-muted-foreground">
      © {year} SW Farm — Bordack
    </footer>
  );
}
