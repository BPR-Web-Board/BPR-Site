import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b border-gray-100">
      <div className="flex-shrink-0">
        <Link href="/">
          <div className="text-3xl font-bold tracking-tighter">
            BROWN<br />POLITICAL<br />REVIEW
          </div>
        </Link>
      </div>
      <div className="hidden lg:flex items-center space-x-6">
        <Link href="#" className="text-sm font-medium">
          UNITED STATES
        </Link>
        <Link href="#" className="text-sm font-medium">
          WORLD
        </Link>
        <Link href="#" className="text-sm font-medium">
          ECONOMY
        </Link>
        <Link href="#" className="text-sm font-medium">
          INTERVIEWS
        </Link>
        <Link href="#" className="text-sm font-medium">
          SUSCRIBE
        </Link>
        <Link href="#" className="text-sm font-medium">
          ABOUT
        </Link>
        <button className="focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
