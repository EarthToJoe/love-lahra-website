import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user (Lahra)
  const adminUser = await prisma.user.upsert({
    where: { email: 'lahra@lahraslife.com' },
    update: {},
    create: {
      email: 'lahra@lahraslife.com',
      displayName: 'Lahra',
      role: 'ADMIN',
      preferences: {
        create: {
          emailNotifications: true,
          pushNotifications: true,
          commentNotifications: true,
          newContentNotifications: true,
          pollNotifications: true,
          showProfile: true,
          allowMentions: true,
        }
      }
    },
  })

  // Create test user (Joe)
  const testUser = await prisma.user.upsert({
    where: { email: 'joehughes92@gmail.com' },
    update: {},
    create: {
      email: 'joehughes92@gmail.com',
      displayName: 'Joe Hughes',
      role: 'USER',
      preferences: {
        create: {
          emailNotifications: true,
          pushNotifications: true,
          commentNotifications: true,
          newContentNotifications: true,
          pollNotifications: true,
          showProfile: true,
          allowMentions: true,
        }
      }
    },
  })

  // Create sample content sections
  const dailyActivity = await prisma.contentSection.create({
    data: {
      type: 'DAILY_ACTIVITY',
      title: "What's Lahra doing today?",
      content: "Starting the morning with a power breakfast meeting at The Plaza, followed by a Senate committee hearing on economic policy. This afternoon, I'm reviewing wedding venue options with my planner - thinking something coastal with black-tie elegance.",
      isPublished: true,
      publishedAt: new Date(),
    }
  })

  const closetSection = await prisma.contentSection.create({
    data: {
      type: 'CLOSET',
      title: "What's in her closet?",
      content: "A curated collection of sophisticated pieces that transition seamlessly from boardroom to ballroom. Think tailored blazers, elegant cocktail dresses, and statement accessories that command attention.",
      isPublished: true,
      publishedAt: new Date(),
    }
  })

  const diningSection = await prisma.contentSection.create({
    data: {
      type: 'DINING',
      title: "Where is Lahra eating this week?",
      content: "This week's culinary journey includes Le Bernardin for their legendary seafood tasting menu, a private dinner at Daniel, and weekend brunch at The Carlyle. Each venue chosen for both exceptional cuisine and the perfect ambiance for important conversations.",
      isPublished: true,
      publishedAt: new Date(),
    }
  })

  // Create sample polls
  const weddingDressPoll = await prisma.poll.create({
    data: {
      question: "What's her wedding dress look like?",
      description: "Help choose the perfect wedding dress style for the big day!",
      allowMultipleVotes: false,
      isActive: true,
      options: {
        create: [
          {
            text: "Classic A-line with cathedral train",
            order: 1,
          },
          {
            text: "Sleek mermaid silhouette",
            order: 2,
          },
          {
            text: "Vintage-inspired ball gown",
            order: 3,
          },
          {
            text: "Modern minimalist design",
            order: 4,
          }
        ]
      }
    }
  })

  const thisOrThatPoll = await prisma.poll.create({
    data: {
      question: "Lahra likes: This or That?",
      description: "NYC rooftop bars vs. Coastal wine tastings",
      allowMultipleVotes: false,
      isActive: true,
      options: {
        create: [
          {
            text: "NYC rooftop bars with city skyline views",
            order: 1,
          },
          {
            text: "Coastal wine tastings with ocean breezes",
            order: 2,
          }
        ]
      }
    }
  })

  // Create sample outfit
  const favoriteOutfit = await prisma.outfit.create({
    data: {
      title: "Senate Hearing Power Look",
      description: "The perfect balance of authority and elegance for important political meetings",
      occasion: "Professional/Political",
      season: "Fall",
      isFavorite: true,
      isOutfitOfMonth: true,
      items: {
        create: [
          {
            name: "Tailored Navy Blazer",
            brand: "Theory",
            category: "TOP",
            color: "Navy",
            price: 495.00
          },
          {
            name: "Silk Blouse",
            brand: "Equipment",
            category: "TOP", 
            color: "Champagne",
            price: 248.00
          },
          {
            name: "High-waisted Trousers",
            brand: "Theory",
            category: "BOTTOM",
            color: "Navy",
            price: 345.00
          },
          {
            name: "Pointed Toe Pumps",
            brand: "Christian Louboutin",
            category: "SHOES",
            color: "Black",
            price: 795.00
          },
          {
            name: "Pearl Earrings",
            brand: "Mikimoto",
            category: "JEWELRY",
            color: "White",
            price: 1200.00
          }
        ]
      }
    }
  })

  // Create donation goal
  const donationGoal = await prisma.donationGoal.create({
    data: {
      title: "Wedding Fund",
      description: "Help make the dream wedding a reality! Contributing to venue, catering, and all the elegant details that make a celebration unforgettable.",
      targetAmount: 50000.00,
      currentAmount: 12500.00,
      isActive: true,
      deadline: new Date('2024-12-31')
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log({
    adminUser: adminUser.id,
    testUser: testUser.id,
    contentSections: [dailyActivity.id, closetSection.id, diningSection.id],
    polls: [weddingDressPoll.id, thisOrThatPoll.id],
    outfit: favoriteOutfit.id,
    donationGoal: donationGoal.id
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })