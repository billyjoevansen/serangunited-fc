const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Serang United FC x Komite Olahraga Nasional Indonesia
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>• Sistem Rekrutmen Pemain v1.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
