import Link from 'next/link'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    'About': [
      { name: 'About Lahra', href: '/about' },
      { name: 'Fun Facts', href: '/fun-facts' },
      { name: 'Contact', href: '/contact' },
    ],
    'Content': [
      { name: 'Daily Life', href: '/daily' },
      { name: 'Outfits', href: '/outfits' },
      { name: 'Dining', href: '/dining' },
      { name: 'Polls', href: '/polls' },
    ],
    'Community': [
      { name: 'Join the Fun', href: '/auth/signin' },
      { name: 'Support', href: '/donate' },
      { name: 'Guidelines', href: '/guidelines' },
    ],
  }

  return (
    <footer className="bg-primary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-500 rounded-full flex items-center justify-center">
                <span className="text-primary-900 font-bold text-sm">L</span>
              </div>
              <span className="ml-2 text-xl font-serif font-semibold">
                Lahra's Life
              </span>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Join me on this journey through daily adventures, fashion discoveries, 
              culinary experiences, and all the little moments that make life beautiful.
            </p>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-accent-300 font-semibold text-sm uppercase tracking-wider mb-4">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-neutral-300 hover:text-accent-300 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-primary-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-neutral-400 text-sm">
              © {currentYear} Lahra's Life. Made with love and sophistication.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-neutral-400 hover:text-accent-300 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-neutral-400 hover:text-accent-300 text-sm transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer