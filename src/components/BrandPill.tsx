import Link from "next/link";
import Image from "next/image";
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
      <span className="inline-flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="On mange où ? logo"
          width={22}
          height={22}
          className="rounded-full"
        />
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
