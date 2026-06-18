import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Search, Youtube, Menu, Settings, X, LogIn, LogOut, Activity, Sun, Moon } from "lucide-react";
import { Button } from "./ui";
import { useAuth } from "../lib/AuthContext";
import { motion, AnimatePresence } from "motion/react";

export default function ToolbarLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });
  const location = useLocation();
  const { user, signIn, logOut } = useAuth();

  // Sync theme with document class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Reset menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 flex flex-col font-sans overflow-x-hidden transition-colors duration-200">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/50 backdrop-blur">
        <div className="container mx-auto flex py-4 items-center px-4 md:px-8 justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-red-600/20">T</div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Tool<span className="text-red-600 dark:text-red-500">zet</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`transition-colors hover:text-slate-900 dark:hover:text-white ${
                  location.pathname === link.href ? "text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden lg:flex relative w-full max-w-xs">
              <Search className="absolute left-4 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                placeholder="Search tools..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-slate-900 dark:text-slate-200 placeholder:text-slate-500"
              />
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            <Button variant="ghost" size="icon" className="md:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/my-battles">
                  <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <Activity className="h-4 w-4 mr-2" />
                    My Battles
                  </Button>
                </Link>
                <div className="relative">
                  <div 
                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    title="Profile Menu"
                  >
                    {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />}
                  </div>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-50 origin-top-right"
                      >
                        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 mb-2">
                           <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.displayName || "User"}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email || ""}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setProfileMenuOpen(false);
                            logOut();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={signIn} className="hidden md:flex bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 space-y-4 overflow-hidden"
            >
              <div className="py-4">
                <nav className="flex flex-col gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={location.pathname === link.href ? "text-slate-900 dark:text-white" : "hover:text-slate-900 dark:hover:text-white"}
                    >
                      {link.name}
                    </Link>
                  ))}
                  {user && (
                    <Link to="/my-battles" className={location.pathname === "/my-battles" ? "text-slate-900 dark:text-white" : "hover:text-slate-900 dark:hover:text-white"}>
                      My Battles
                    </Link>
                  )}
                </nav>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
                  {user ? (
                    <Button variant="outline" className="w-full justify-start text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" onClick={logOut}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout ({user.displayName || 'User'})
                    </Button>
                  ) : (
                    <Button variant="default" className="w-full justify-start bg-red-600 hover:bg-red-700 text-white border-0" onClick={signIn}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 w-full mt-auto">
        <div className="flex flex-col gap-2 mb-4 md:mb-0">
          <div className="flex gap-4 md:gap-6 justify-center md:justify-start">
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors whitespace-nowrap">Privacy Policy</a>
            <span className="text-slate-300 dark:text-slate-800 hidden md:inline">•</span>
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors whitespace-nowrap">Terms of Service</a>
          </div>
          <div className="flex gap-4 md:gap-6 justify-center md:justify-start">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors whitespace-nowrap">Sitemap.xml</a>
            <span className="text-slate-300 dark:text-slate-800 hidden md:inline">•</span>
            <a href="/contact-support" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors whitespace-nowrap">Contact Support</a>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 hidden md:flex">
          <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full border border-white dark:border-slate-950 bg-slate-200 dark:bg-slate-700"></div>
            <div className="w-5 h-5 rounded-full border border-white dark:border-slate-950 bg-slate-300 dark:bg-slate-600"></div>
            <div className="w-5 h-5 rounded-full border border-white dark:border-slate-950 bg-slate-400 dark:bg-slate-500"></div>
          </div>
          <span>Trusted by 12,000+ Creators</span>
        </div>
        <div className="mt-4 md:mt-0">© {new Date().getFullYear()} Toolzet. Built for Success.</div>
      </footer>
    </div>
  );
}
