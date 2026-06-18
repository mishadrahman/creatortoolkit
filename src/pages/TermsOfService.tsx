import React, { useEffect } from "react";
import SEO from "../components/SEO";

export default function TermsOfService() {
  useEffect(() => {
    window.location.replace("/terms-of-service.html");
  }, []);

  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Review the acceptable usage policies, guidelines, and terms governing your access to the free tools suite on Toolzet."
        keywords="terms of service, legal guidelines, acceptable use policy, toolzet terms"
      />
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-slate-500 font-medium">
        Redirecting to Terms of Service...
      </div>
    </>
  );
}
