# Database Migration & Production Deployment Plan

## Overview
This document outlines the migration from mock data systems to production database integration, including admin role management and deployment considerations for future Kiro sessions.

## Current State (Development)
- **Authentication**: Mock system with in-memory storage
- **Content**: Mock data in components and API routes
- **Admin Access**: Hardcoded whitelist system (`mockAdminUsers`)
- **Database**: Prisma schema defined but using mock data

## Migration Tasks for Task 14 (Final Integration)

### 14.1 Database Integration
- [ ] **Set up production database** (PostgreSQL recommended)
- [ ] **Migrate Prisma schema** to production database
- [ ] **Replace mock authentication** with real NextAuth database adapter
- [ ] **Migrate content APIs** from mock data to database queries
- [ ] **Update admin authentication** to use database roles

### 14.2 Admin Role System Migration

#### Current Admin System (Secure but Limited)
```typescript
// Current: Hardcoded whitelist
export const mockAdminUsers = new Set([
  'Lahra',
  'admin', 
  'IrishPicasso'
])
```

#### Production Admin System (Database-Driven)
```typescript
// Target: Database role-based system
const isAdmin = session.user?.role === 'ADMIN' || 
                session.user?.role === 'SUPER_ADMIN'
```

#### Required Database Changes
1. **Add role field to User model**:
```prisma
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  displayName String
  role        UserRole @default(USER)
  // ... existing fields
}

enum UserRole {
  USER
  MODERATOR
  ADMIN
  SUPER_ADMIN
}
```

2. **Create admin management interface**:
   - Admin invitation system
   - Role assignment UI
   - Admin activity logging

### 14.3 Content Management Migration
- [ ] **Replace mock content APIs** with database operations
- [ ] **Implement content versioning** (Property 17 requirements)
- [ ] **Add content scheduling** and publishing workflows
- [ ] **Migrate image storage** to cloud provider (AWS S3/Cloudinary)

### 14.4 Production Security Enhancements
- [ ] **Environment variables** for sensitive configuration
- [ ] **Rate limiting** for API endpoints
- [ ] **CSRF protection** for admin actions
- [ ] **Audit logging** for admin activities
- [ ] **Backup and recovery** procedures

## Deployment Checklist

### Pre-Deployment
- [ ] Set up production database (PostgreSQL)
- [ ] Configure environment variables
- [ ] Set up image storage (AWS S3 or similar)
- [ ] Configure email service (for notifications)
- [ ] Set up monitoring and logging

### Database Setup
```sql
-- Initial admin user setup
INSERT INTO users (email, displayName, role) 
VALUES ('lahra@example.com', 'Lahra', 'SUPER_ADMIN');
```

### Environment Variables Required
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://yourdomain.com"

# Image Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."

# Email Service
RESEND_API_KEY="..."
```

### Admin Access Management (Production)

#### Initial Setup
1. **Create first admin** via database insert
2. **Remove development whitelist** from `admin-auth.ts`
3. **Enable database role checking**

#### Ongoing Management
- Admins can invite new admins through UI
- Role changes logged for security
- Emergency admin access via database

## Migration Strategy

### Phase 1: Database Foundation
1. Set up production database
2. Run Prisma migrations
3. Seed initial data

### Phase 2: Authentication Migration
1. Configure NextAuth database adapter
2. Migrate user accounts
3. Update admin role system

### Phase 3: Content Migration
1. Replace mock APIs with database queries
2. Migrate existing content
3. Test all CRUD operations

### Phase 4: Production Hardening
1. Security enhancements
2. Performance optimization
3. Monitoring setup

## Testing Requirements

### Pre-Migration Testing
- [ ] All property-based tests passing
- [ ] Integration tests for admin workflows
- [ ] Performance testing with realistic data volumes

### Post-Migration Testing
- [ ] Database connection and queries
- [ ] Admin role system functionality
- [ ] Content management workflows
- [ ] Image upload and storage
- [ ] Email notifications

## Rollback Plan
- Database backup before migration
- Keep mock system as fallback
- Staged deployment with monitoring

## Notes for Future Kiro Sessions
- Current admin system is secure and functional for development
- Migration should happen during Task 14 (Final Integration)
- All admin functionality is already built and tested
- Focus on database integration rather than rebuilding features

## Security Considerations
- ✅ Removed email-based admin access (security fix applied)
- ✅ Role-based access control implemented
- ✅ Admin actions properly authenticated
- 🔄 Database-driven roles (pending migration)
- 🔄 Audit logging (pending implementation)

---
*Last Updated: Task 10 Completion*
*Next Review: Task 14 (Final Integration)*