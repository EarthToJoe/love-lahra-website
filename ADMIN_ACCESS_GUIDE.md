# Admin Access Guide

## How Admin Access Works

Admin access in Lahra's Life is controlled by the `role` field in the User database table. There are three roles:

- **USER** - Regular user (default)
- **MODERATOR** - Can manage content and moderate comments
- **ADMIN** - Full access to all admin features

## Granting Admin Access

### Method 1: Using the Grant Admin Script (Recommended)

Run the provided script to grant admin access to a user:

```bash
npx tsx grant-admin.ts
```

This script will:
1. Check if the user exists in the database
2. If exists: Update their role to ADMIN
3. If not exists: Create a new user with ADMIN role

**Default credentials in the script:**
- Email: `joehughes92@gmail.com`
- Display Name: `Irish Picasso`
- Password: `password123`
- Role: `ADMIN`

To grant admin to a different user, edit `grant-admin.ts` and change the email/credentials.

### Method 2: Direct Database Update

If you have access to your Supabase dashboard or database client:

```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

### Method 3: Using Prisma Studio

```bash
npx prisma studio
```

1. Open the `users` table
2. Find your user
3. Change the `role` field to `ADMIN`
4. Save

## Accessing the Admin Panel

Once you have admin privileges:

1. **Login** to the application with your credentials
2. **Navigate** to `/admin` or click any admin link
3. The system will verify your role from the database
4. If authorized, you'll see the admin panel

## Admin Panel Features

### Available Routes:
- `/admin` - Admin dashboard
- `/admin/images` - Image management
- `/admin/polls` - Poll management
- `/admin/donations` - Donation tracking
- `/admin/comments` - Comment moderation
- `/admin/daily` - Daily content management
- `/admin/dining` - Dining content management
- `/admin/snacks` - Snacks content management
- `/admin/outfits` - Outfit management
- `/admin/fun-facts` - Fun facts management
- `/admin/watchlist` - Watchlist management
- `/admin/this-or-that` - This or That management
- `/admin/settings` - System settings

## Security Features

### Client-Side Protection
- Admin layout checks authorization before rendering
- Redirects unauthorized users to login or home page
- Shows loading state during authorization check

### Server-Side Protection
- All admin API routes verify role from database
- Uses `isAdmin()` helper from `@/lib/admin-auth`
- Checks session and database role on every request

### Role-Based Permissions

**ADMIN** can:
- Manage all content
- Moderate comments
- Manage users and roles
- Access system settings
- View analytics and reports

**MODERATOR** can:
- Manage content
- Moderate comments
- Limited access to user management

**USER** can:
- View public content
- Post comments
- Vote on polls
- Make donations

## Troubleshooting

### "Unauthorized" Error
- Check that your user's role is set to `ADMIN` in the database
- Verify you're logged in with the correct account
- Clear browser cache and cookies, then login again

### Can't Access Admin Routes
- Run `npx tsx grant-admin.ts` to ensure admin role is set
- Check browser console for errors
- Verify database connection is working

### Admin Check Fails
- Check `/api/admin/check-access` endpoint
- Verify NextAuth session is working
- Check server logs for errors

## Managing Other Admins

### Promote User to Admin

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

await prisma.user.update({
  where: { email: 'user@example.com' },
  data: { role: 'ADMIN' }
})
```

### Demote Admin to User

```typescript
await prisma.user.update({
  where: { email: 'admin@example.com' },
  data: { role: 'USER' }
})
```

### Create Moderator

```typescript
await prisma.user.update({
  where: { email: 'moderator@example.com' },
  data: { role: 'MODERATOR' }
})
```

## Best Practices

1. **Limit Admin Accounts** - Only grant admin access to trusted users
2. **Use Strong Passwords** - Admins should use secure passwords
3. **Regular Audits** - Periodically review who has admin access
4. **Separate Accounts** - Use different accounts for admin vs regular use
5. **Monitor Activity** - Check admin actions in logs

## Current Admin User

After running `grant-admin.ts`, the following user has admin access:

- **Email**: joehughes92@gmail.com
- **Display Name**: Irish Picasso
- **Role**: ADMIN
- **Password**: password123

You can now login and access `/admin` routes!
