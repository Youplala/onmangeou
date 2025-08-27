import Link from "next/link";
import React from "react";

export default function BrandPill({ showBeta = true, className = "" }: { showBeta?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="On mange où ?"
      className={
        "rounded-full bg-white/60 backdrop-blur px-3 md:px-4 py-1.5 ring-1 ring-black/10 shadow-sm flex items-center gap-2 text-black hover:bg-white/70 transition " +
        className
      }
    >
      <span className="text-black inline-flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M8.25 7v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M10.25 7v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M15.9 7.4c-.6 0-1.1.46-1.16 1.05L14.4 13m3.2 0-.34-4.55A1.16 1.16 0 0 0 16.1 7.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </span>
      <span className="font-black text-lg md:text-2xl tracking-tight">On mange où ?</span>
      {showBeta && (
        <span className="ml-1 hidden md:inline-flex items-center rounded-full bg-black text-white text-[10px] px-2 py-0.5 font-bold">
          v1
        </span>
      )}
    </Link>
  );
}
