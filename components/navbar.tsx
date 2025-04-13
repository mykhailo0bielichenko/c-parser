import Link from "next/link"

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold">Casino Parser</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:underline">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}
