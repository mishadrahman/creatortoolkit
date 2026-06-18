import React, { useEffect } from "react";
import SEO from "../components/SEO";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.location.replace("/privacy-policy.html");
  }, []);

  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Learn how Toolzet respects, safeguards, and handles your private metadata and account safety features."
        keywords="privacy policy, data safety, creator tools privacy, cookie consent"
      />
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-slate-500 font-medium">
        Redirecting to Privacy Policy...
      </div>
    </>
  );
}
