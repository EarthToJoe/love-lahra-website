import { ReactNode } from 'react'
import Navigation from './navigation'
import Footer from './footer'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

const MainLayout = ({ children, className = '' }: MainLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navigation />
      <main className={`flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout