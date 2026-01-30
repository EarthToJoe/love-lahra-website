import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function grantAdmin() {
  const email = 'joehughes92@gmail.com'
  const displayName = 'Irish Picasso'
  const password = 'password123'
  
  console.log(`Checking for user: ${email}`)
  
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (user) {
    console.log('User found! Updating role to ADMIN...')
    user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    console.log(`✅ ${user.displayName} is now an ADMIN`)
  } else {
    console.log('User not found. Creating new user with ADMIN role...')
    const hashedPassword = await hash(password, 12)
    user = await prisma.user.create({
      data: {
        email,
        displayName,
        password: hashedPassword,
        role: 'ADMIN',
      }
    })
    console.log(`✅ Created new ADMIN user: ${user.displayName}`)
  }
  
  console.log('\nUser details:')
  console.log(`- Email: ${user.email}`)
  console.log(`- Display Name: ${user.displayName}`)
  console.log(`- Role: ${user.role}`)
  console.log('\nYou can now access /admin routes!')
  
  await prisma.$disconnect()
}

grantAdmin()
