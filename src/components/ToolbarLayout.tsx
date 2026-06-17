import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, Youtube, Menu, Settings, X, LogIn, Moon, Sun } from "lucide-react";
import { Button } from "./ui";

export default function ToolbarLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  // Reset menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Thumbnails", href: "/thumbnail-downloader" },
    { name: "Titles", href: "/title-generator" },
    { name: "Hashtags", href: "/hashtag-generator" },
    { name: "Descriptions", href: "/description-generator" },
    { name: "Names", href: "/channel-name-generator" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans overflow-x-hidden">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="container mx-auto flex py-4 items-center px-4 md:px-8 justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/20">C</div>
            <span className="text-xl font-bold tracking-tight text-white">Creator<span className="text-red-500">Toolkit</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`transition-colors hover:text-white ${
                  location.pathname === link.href ? "text-white border-b border-white" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex relative w-full max-w-xs">
              <Search className="absolute left-4 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="search"
                placeholder="Search tools..."
                className="w-full bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-slate-200 placeholder:text-slate-500"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="hidden md:flex w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-slate-800 shrink-0"></div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-4 text-sm font-medium text-slate-400">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={location.pathname === link.href ? "text-white" : "hover:text-white"}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 w-full mt-auto">
        <div className="flex gap-4 md:gap-8 mb-4 md:mb-0 max-w-full overflow-x-auto">
          <a href="#" className="hover:text-slate-300 transition-colors whitespace-nowrap">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300 transition-colors whitespace-nowrap">Terms of Service</a>
          <a href="#" className="hover:text-slate-300 transition-colors whitespace-nowrap">Sitemap</a>
          <a href="#" className="hover:text-slate-300 transition-colors whitespace-nowrap">Contact Support</a>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 hidden md:flex">
          <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full border border-slate-950 bg-slate-700"></div>
            <div className="w-5 h-5 rounded-full border border-slate-950 bg-slate-600"></div>
            <div className="w-5 h-5 rounded-full border border-slate-950 bg-slate-500"></div>
          </div>
          <span>Trusted by 12,000+ Creators</span>
        </div>
        <div className="mt-4 md:mt-0">© {new Date().getFullYear()} Creator Toolkit. Built for Success.</div>
      </footer>
    </div>
  );
}
