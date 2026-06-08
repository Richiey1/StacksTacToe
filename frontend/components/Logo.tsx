import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3 text-sm font-semibold tracking-tight text-foreground"
      aria-label="StacksTacToe home"
    >
      <svg className="h-10 w-10 transition-transform duration-200 group-hover:scale-105" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="8" fill="#000"/>
        <rect x="2" y="2" width="60" height="60" rx="6" stroke="#F97316" strokeWidth="2"/>
        <line x1="22" y1="8" x2="22" y2="56" stroke="#F97316" strokeWidth="2"/>
        <line x1="42" y1="8" x2="42" y2="56" stroke="#F97316" strokeWidth="2"/>
        <line x1="8" y1="22" x2="56" y2="22" stroke="#F97316" strokeWidth="2"/>
        <line x1="8" y1="42" x2="56" y2="42" stroke="#F97316" strokeWidth="2"/>
        <line x1="12" y1="12" x2="20" y2="20" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
        <line x1="20" y1="12" x2="12" y2="20" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="32" cy="32" r="5" stroke="#F97316" strokeWidth="3"/>
        <line x1="44" y1="28" x2="52" y2="36" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
        <line x1="52" y1="28" x2="44" y2="36" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      <span className="leading-tight hidden sm:block font-pixel text-xs sm:text-sm tracking-tight">
        <span className="text-orange-500 font-bold">STACKS</span>
        <span className="text-white font-bold">TacToe</span>
      </span>
    </Link>
  );
}
