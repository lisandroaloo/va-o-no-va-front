import Link from "next/link"

export function Navbar() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl">
      
        <span>Va o no va?</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
          Acerca de
        </Link>
        <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
          Contacto
        </Link>
      </nav>
    </header>
  )
}
