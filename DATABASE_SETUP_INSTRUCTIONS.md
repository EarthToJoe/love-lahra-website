# Database Setup Instructions

## Current Status

✅ **Code Integration Complete** - All API routes have been updated to use Prisma and PostgreSQL
⏳ **Database Migration Pending** - Schema changes need to be applied to the database

## What Was Done

All remaining mock data has been replaced with database queries:

1. **User Preferences** (`/api/user/preferences`)
   - GET, PUT, and PATCH endpoints now use `prisma.userPreferences`
   - Automatically creates default preferences for new users

2. **Donations** (`/api/donations`)
   - GET endpoint now fetches from `prisma.donation`
   - Includes stats calculation (total amount, donors, average)

3. **This or That** (`/api/this-or-that`)
   - Added new `ThisOrThat` and `ThisOrThatVote` models to Prisma schema
   - GET and POST endpoints use database
   - Vote tracking prevents duplicate votes per visitor

## Next Steps

To complete the database integration, you need to:

### 1. Start Your PostgreSQL Database

Your application expects PostgreSQL on `localhost:51214`. Start your database server.

### 2. Apply Schema Changes

Run one of these commands to update your database schema:

```bash
cd lahras-life

# Option A: Create a migration (recommended for production)
npx prisma migrate dev --name add_this_or_that

# Option B: Push schema directly (faster for development)
npx prisma db push
```

### 3. Verify the Integration

```bash
# View your database in Prisma Studio
npx prisma studio

# Restart the dev server if needed
npm run dev
```

### 4. Test the Features

Visit your application and test:
- User preferences (profile settings)
- This or That voting
- Donations display
- All previously working features (comments, polls, notifications)

## New Database Tables

The schema now includes:

- `this_or_that` - Stores This or That questions with vote counts
- `this_or_that_votes` - Tracks which visitors voted on which questions

## Troubleshooting

### Database Connection Error

If you see `Can't reach database server at localhost:51214`:
- Make sure PostgreSQL is running
- Check your `.env` file has the correct `DATABASE_URL`
- Verify the port number matches your PostgreSQL instance

### Migration Conflicts

If migrations fail:
```bash
# Reset and reapply all migrations (WARNING: deletes data)
npx prisma migrate reset

# Or push schema without migrations
npx prisma db push --force-reset
```

## What's Stored in the Database Now

✅ **All Data Persists:**
- User accounts and authentication
- User preferences (notifications, privacy settings)
- Comments with threading and likes
- Poll questions, options, and votes
- This or That questions and votes
- Notifications
- Donations
- Content sections and images
- Outfits and outfit items

## Production Deployment

When deploying to production:

1. Set up a production PostgreSQL database (Vercel Postgres, Railway, Supabase, etc.)
2. Update `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate deploy`
4. Your application will automatically use the production database

---

**Status:** Code complete, database migration pending
**Last Updated:** January 27, 2026
