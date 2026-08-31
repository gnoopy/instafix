const links = [
  {
    label: "GitHub",
    href: "https://github.com/gnoopy/InstaFix",
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/@instafix/widget",
  },
  {
    label: "Documentation",
    href: "/docs",
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg font-bold tracking-tight text-white">InstaFix</p>
            <p className="mt-1 text-sm text-gray-500">Open-source feedback widget</p>
          </div>

          <nav>
            <ul className="flex items-center gap-6">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-gray-800 pt-6 text-xs text-gray-600 sm:flex-row sm:items-center">
          <span>MIT License</span>
          <span>
            Built by{" "}
            <a
              href="https://github.com/gnoopy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 transition-colors hover:text-gray-300"
            >
              @gnoopy
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
