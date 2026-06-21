import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, Home, Compass, Search } from "lucide-react";
import SEO from "../components/SEO";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center animate-fade-in">
      <SEO 
        title="404 - Page Not Found" 
        description="The page you are looking for does not exist on Toolzet. Return home to discover our powerful creator tools." 
        keywords="404, page not found, toolzet 404"
      />
      
      {/* Decorative Icon Grid */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/5 blur-3xl rounded-full w-48 h-48 mx-auto -translate-y-4"></div>
        <div className="relative bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-full p-8 mx-auto w-32 h-32 flex items-center justify-center shadow-sm">
          <AlertCircle className="w-16 h-16 text-red-600 dark:text-red-500 animate-pulse" />
        </div>
        <div className="absolute -top-1 -right-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-2 shadow-sm">
          <Search className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Hero Text */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
        Oops! Page Not Found
      </h1>
      
      <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
        We couldn't find the page you're looking for. It might have been moved, deleted, or the URL might be incorrect.
      </p>

      {/* Interactive Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <Link to="/">
          <Button className="font-semibold px-6 gap-2 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
        
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="font-semibold px-6 gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
      </div>

      {/* Suggested Quick Links / Shortcuts */}
      <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-900 w-full max-w-lg">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
          <Compass className="w-3.5 h-3.5" />
          Popular Creator Tools
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <Link 
            to="/thumbnail-battle" 
            className="p-3 text-xs font-medium rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-500 transition-all"
          >
            Thumbnail Battle (A/B Test)
          </Link>
          <Link 
            to="/thumbnail-preview" 
            className="p-3 text-xs font-medium rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-500 transition-all"
          >
            Thumbnail Previewer
          </Link>
          <Link 
            to="/title-generator" 
            className="p-3 text-xs font-medium rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-500 transition-all"
          >
            AI Title Generator
          </Link>
          <Link 
            to="/thumbnail-downloader" 
            className="p-3 text-xs font-medium rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:border-red-500/30 hover:text-red-600 dark:hover:text-red-500 transition-all"
          >
            Video Cover Grabber
          </Link>
        </div>
      </div>
    </div>
  );
}
