import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t mt-10">
  <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left w-full">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} JodKaam • Connect work, locally</p>
        <nav className="text-sm flex flex-col sm:flex-row gap-2 sm:gap-4 text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
