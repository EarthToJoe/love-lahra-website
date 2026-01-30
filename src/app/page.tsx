'use client'

import { useSession, signIn } from 'next-auth/react'
import { useImages } from '@/hooks/useImages'
import Link from 'next/link'
import { PhotoHero } from '@/components/ui/photo-hero'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { HeroTitle } from '@/components/ui/hero-title'
import { motion } from 'framer-motion'

export default function Home() {
  const { data: session } = useSession()
  const { images: allImages, loading } = useImages()
  
  // Get featured photos for hero (latest 3 outfit photos)
  const featuredPhotos = allImages
    .filter(img => img.category === 'outfits')
    .slice(0, 3)
    .map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      title: img.title,
      category: img.category
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sophisticated Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
              aria-label="Love, Lahra - Go to homepage"
            >
              Love, Lahra
            </Link>
            
            <div className="hidden md:flex space-x-8" role="menubar">
              <Link 
                href="/" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                Home
              </Link>
              <Link 
                href="/daily" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                My Day
              </Link>
              <Link 
                href="/outfits" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                Style
              </Link>
              <Link 
                href="/dining" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                Dining
              </Link>
              <Link 
                href="/snacks" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                Snacks
              </Link>
              <Link 
                href="/fun-facts" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                Fun Facts
              </Link>
              <Link 
                href="/polls" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                Polls
              </Link>
              <Link 
                href="/this-or-that" 
                className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                role="menuitem"
              >
                This or That
              </Link>
            </div>

            <div>
              {session ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/profile" 
                    className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    aria-label={`Profile for ${session.user?.name}`}
                  >
                    {session.user?.name}
                  </Link>
                  <button 
                    className="text-primary-700 hover:text-primary-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <button 
                    className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8" role="main">
        {/* Hero Section with Real Photos */}
        <section aria-labelledby="hero-title" className="mb-16">
          {!loading && featuredPhotos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <PhotoHero 
                photos={featuredPhotos}
                autoSlide={true}
                slideInterval={6000}
                className="mb-8"
              />
            </motion.div>
          )}

          {/* Traditional Hero Section (fallback or alongside photos) */}
          <header className="text-center">
            <HeroTitle id="hero-title" className="text-5xl md:text-7xl font-bold text-primary-900 mb-6 font-dancing leading-relaxed pb-4" />
            <p className="text-xl text-primary-600 max-w-3xl mx-auto leading-relaxed">
              Follow along as I share my daily adventures, style choices, dining discoveries, 
              and all the little moments that make life beautiful. Welcome to my world of 
              sophisticated living and authentic experiences.
            </p>
            
            {/* Photo Stats */}
            {!loading && allImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex justify-center items-center space-x-8 text-sm text-primary-500"
                role="region"
                aria-label="Photo statistics"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg" aria-hidden="true">📸</span>
                  <span>{allImages.length} moments captured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg" aria-hidden="true">👗</span>
                  <span>{allImages.filter(img => img.category === 'outfits').length} style looks</span>
                </div>
              </motion.div>
            )}
          </header>
        </section>

        {/* Content Grid - Enhanced with Photo Previews */}
        <section aria-labelledby="content-sections-title" className="mb-16">
          <h2 id="content-sections-title" className="sr-only">Content Sections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                title: "What I'm Up To Today", 
                icon: "✨", 
                desc: "Daily glimpses into my life, adventures, and the moments that matter most.",
                gradient: "from-pink-500 to-rose-500",
                href: "/daily",
                category: "daily"
              },
              { 
                title: "My Style Diary", 
                icon: "👗", 
                desc: "Fashion choices, outfit inspirations, and the stories behind my looks.",
                gradient: "from-purple-500 to-indigo-500",
                href: "/outfits",
                category: "outfits"
              },
              { 
                title: "Where I'm Dining", 
                icon: "🍽️", 
                desc: "Restaurant discoveries, culinary adventures, and my favorite food experiences.",
                gradient: "from-amber-500 to-orange-500",
                href: "/dining",
                category: "dining"
              },
              { 
                title: "My Snack Adventures", 
                icon: "🥨", 
                desc: "From artisanal treats to guilty pleasures - what I'm munching on lately.",
                gradient: "from-red-500 to-pink-500",
                href: "/snacks",
                category: "snacks"
              },
              { 
                title: "Fun Facts About Me", 
                icon: "🎭", 
                desc: "Quirky stories, random trivia, and the little things that make me, me.",
                gradient: "from-cyan-500 to-blue-500",
                href: "/fun-facts",
                category: "general"
              },
              { 
                title: "Help Me Decide!", 
                icon: "🗳️", 
                desc: "Vote on my daily choices! From outfits to restaurants - your input shapes my adventures.",
                gradient: "from-emerald-500 to-teal-500",
                href: "/polls",
                category: "general"
              },
              { 
                title: "This or That?", 
                icon: "🤔", 
                desc: "Quick vibe checks! Choose between beautiful options based on pure aesthetic and feeling.",
                gradient: "from-violet-500 to-purple-500",
                href: "/this-or-that",
                category: "general"
              },
              { 
                title: "What I'm Watching", 
                icon: "📺", 
                desc: "Entertainment recommendations and what's currently on my screen.",
                gradient: "from-blue-500 to-cyan-500",
                href: "/watchlist",
                category: "general"
              }
            ].map((section, index) => {
              const categoryImages = allImages.filter(img => img.category === section.category)
              const hasImages = categoryImages.length > 0
              const backgroundImage = hasImages ? categoryImages[0].url : null
              
              return (
                <article key={index} className="group relative">
                  <Link href={section.href} className="block" aria-describedby={`section-${index}-desc`}>
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl -z-10" 
                         style={{background: `linear-gradient(to right, var(--tw-gradient-stops))`}} aria-hidden="true"></div>
                    <div 
                      className="relative bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 group-hover:scale-105 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2"
                      style={backgroundImage ? {
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      } : {}}
                    >
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${section.gradient} text-white text-2xl mb-6 shadow-lg`} aria-hidden="true">
                        {section.icon}
                      </div>
                      <h3 className="text-xl font-bold text-primary-900 mb-3">{section.title}</h3>
                      <p id={`section-${index}-desc`} className="text-primary-600 leading-relaxed mb-4">{section.desc}</p>
                      
                      {hasImages && (
                        <div className="text-sm text-primary-500 flex items-center space-x-1" aria-label={`${categoryImages.length} photos available`}>
                          <span aria-hidden="true">📸</span>
                          <span>{categoryImages.length} photo{categoryImages.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        </section>

        {/* Featured Polls Section */}
        <section aria-labelledby="polls-title" className="mb-16">
          <header className="text-center mb-8">
            <h2 id="polls-title" className="text-3xl font-bold text-primary-900 mb-4">Help Me Decide!</h2>
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Your voice matters! Vote on my daily choices and see what others think.
            </p>
          </header>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-primary-900">Latest Polls</h3>
              <Link 
                href="/polls" 
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                aria-label="View all polls"
              >
                <span>View All</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <article className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-xl border border-primary-100">
                <h4 className="font-semibold text-primary-900 mb-2">Which outfit should I wear to the gala tonight?</h4>
                <p className="text-sm text-primary-600 mb-4">Help me choose between these elegant options!</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-500" aria-label="25 people have voted">25 votes</span>
                  <Link 
                    href="/polls" 
                    className="text-primary-600 hover:text-primary-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    aria-label="Vote on gala outfit poll"
                  >
                    Vote Now →
                  </Link>
                </div>
              </article>
              
              <article className="bg-gradient-to-br from-accent-50 to-primary-50 p-6 rounded-xl border border-accent-100">
                <h4 className="font-semibold text-primary-900 mb-2">What should I have for lunch today?</h4>
                <p className="text-sm text-primary-600 mb-4">I'm torn between these delicious options!</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-500" aria-label="18 people have voted">18 votes</span>
                  <Link 
                    href="/polls" 
                    className="text-accent-600 hover:text-accent-700 font-medium focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 rounded-md px-2 py-1"
                    aria-label="Vote on lunch poll"
                  >
                    Vote Now →
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section aria-labelledby="cta-title" className="mb-16">
          <h2 id="cta-title" className="sr-only">Get Started</h2>
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {session ? (
                <>
                  <button 
                    className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Start exploring Lahra's content"
                  >
                    Explore My World
                  </button>
                  <button 
                    className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Share your thoughts and comments"
                  >
                    Share Your Thoughts
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white px-10 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Start exploring Lahra's content"
                  >
                    Explore My World
                  </button>
                  <button
                    onClick={() => signIn()}
                    className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-10 py-4 rounded-full font-semibold text-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Sign in to join the conversation"
                  >
                    Join the Conversation
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section aria-labelledby="support-title" className="mb-16">
          <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4" aria-hidden="true">💝</div>
            <h2 id="support-title" className="text-2xl font-bold text-primary-900 mb-3">Support This Digital Diary</h2>
            <p className="text-primary-600 mb-6 max-w-2xl mx-auto">
              Love the content? Your support helps keep this personal space running and growing with better features and content.
            </p>
            <Link 
              href="/support" 
              className="inline-flex items-center bg-gradient-to-r from-accent-500 to-primary-600 text-white px-6 py-3 rounded-lg hover:from-accent-600 hover:to-primary-700 transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
              aria-label="Support Lahra's digital diary"
            >
              <span aria-hidden="true">💖</span>
              <span className="ml-2">Support Lahra</span>
            </Link>
          </div>
        </section>
      </main>

      {/* Sophisticated Footer */}
      <footer className="bg-gradient-to-r from-primary-900 to-primary-800 text-white" role="contentinfo">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <h3 className="text-3xl font-bold text-white mb-4 pb-2">
                Hey, it's Lahra <span aria-hidden="true">💁‍♀️</span>
              </h3>
              <p className="text-primary-300 leading-relaxed">
                Follow along on my journey through daily adventures, fashion discoveries, 
                and all the moments that make life beautiful.
              </p>
            </div>
            
            <nav aria-labelledby="footer-about-heading">
              <h4 id="footer-about-heading" className="font-semibold text-accent-400 mb-4">About</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">About Lahra</Link></li>
                <li><Link href="/fun-facts" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Fun Facts</Link></li>
                <li><Link href="/contact" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Contact</Link></li>
              </ul>
            </nav>

            <nav aria-labelledby="footer-content-heading">
              <h4 id="footer-content-heading" className="font-semibold text-accent-400 mb-4">Content</h4>
              <ul className="space-y-3">
                <li><Link href="/daily" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">My Day</Link></li>
                <li><Link href="/outfits" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Style</Link></li>
                <li><Link href="/dining" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Dining</Link></li>
                <li><Link href="/snacks" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Snacks</Link></li>
                <li><Link href="/polls" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Polls</Link></li>
              </ul>
            </nav>

            <nav aria-labelledby="footer-community-heading">
              <h4 id="footer-community-heading" className="font-semibold text-accent-400 mb-4">Community</h4>
              <ul className="space-y-3">
                <li><Link href="/auth/signin" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Join the Conversation</Link></li>
                <li><Link href="/support" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Support</Link></li>
                <li><Link href="/guidelines" className="text-primary-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-primary-900 rounded-md px-1 py-0.5">Guidelines</Link></li>
              </ul>
            </nav>
          </div>

          <div className="mt-12 pt-8 border-t border-primary-700">
            <div className="text-center text-primary-400">
              <p>© 2024 Hey, it's Lahra <span aria-hidden="true">💁‍♀️</span>. Made with love and sophistication.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Theme Switcher - Fixed Position */}
      <ThemeSwitcher />
    </div>
  )
}
