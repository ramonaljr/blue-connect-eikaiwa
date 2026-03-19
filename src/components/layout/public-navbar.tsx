'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button, buttonVariants } from '@/components/ui/button'
import { LanguageToggle } from './language-toggle'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/pricing', key: 'pricing' },
  { href: '/tutors', key: 'tutors' },
  { href: '/courses', key: 'courses' },
] as const

export function PublicNavbar() {
  const t = useTranslations('nav')
  const tc = useTranslations('common')
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md transition-all duration-300 supports-[backdrop-filter]:bg-background/60',
          scrolled ? 'border-b shadow-sm' : 'border-b border-transparent'
        )}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold">
              <span className="text-primary">Blue Connect</span>
              <span className="text-muted-foreground text-sm font-normal">Eikaiwa</span>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map(({ href, key }) => (
                <Link
                  key={key}
                  href={href}
                  className="group relative px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t(key)}
                  <span className="absolute inset-x-3 -bottom-px h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }), 'hidden md:inline-flex')}>
              {tc('login')}
            </Link>
            <Link
              href="/signup"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'hidden bg-accent text-accent-foreground hover:bg-accent/90 md:inline-flex'
              )}
            >
              {tc('signup')}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-background p-6 shadow-xl md:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary">Blue Connect</span>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="size-5" />
                </Button>
              </div>
              <nav className="mt-8 flex flex-col gap-1">
                {navLinks.map(({ href, key }, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {t(key)}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                <Link href="/login" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  {tc('login')}
                </Link>
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: 'lg' }), 'bg-accent text-accent-foreground hover:bg-accent/90')}
                >
                  {tc('signup')}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
