import React, { useEffect } from "react";
import SEO from "../components/SEO";

export default function ContactSupport() {
  useEffect(() => {
    window.location.replace("/contact-support.html");
  }, []);

  return (
    <>
      <SEO 
        title="Contact Support"
        description="Need assistance or have feedback for our AI YouTube optimizer tools? Send our team a ticket and we will support you."
        keywords="contact support, client help, tool feedback, support ticket, creator assistance"
      />
      <div className="flex items-center justify-center min-h-[60vh] text-sm text-slate-500 font-medium">
        Redirecting to Contact Support...
      </div>
    </>
  );
}
