import { PublicNavbar } from '@/components/layout/public-navbar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicNavbar />
      {children}
    </>
  )
}
