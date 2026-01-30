# Integration Tests - Setup Required

## Status

Integration test file has been created at `src/test/integration/user-workflows.test.ts` with comprehensive end-to-end workflow tests covering:

1. **User Registration and Content Interaction Workflow**
   - User registration with preferences
   - Content viewing and commenting
   - Poll voting
   - Notification delivery

2. **Admin Content Management Workflow**
   - Draft content creation
   - Image uploads
   - Content publishing
   - Comment moderation

3. **Donation Workflow**
   - Donation goal creation
   - Payment processing
   - Goal progress tracking
   - Thank you notifications

4. **Notification Workflow**
   - User preference handling
   - Notification delivery based on preferences
   - Read/unread status tracking

5. **Cross-Feature Integration**
   - Complete user journey across multiple features
   - Data integrity verification

## Database Setup Required

The tests require a running Prisma Postgres database. The current configuration uses:

```
DATABASE_URL="prisma+postgres://localhost:51213/..."
```

### To Run Tests:

1. **Start Prisma Postgres**:
   ```bash
   prisma dev
   ```

2. **Run Migrations**:
   ```bash
   npx prisma migrate dev
   ```

3. **Run Integration Tests**:
   ```bash
   npm test -- src/test/integration/user-workflows.test.ts
   ```

## Current Issue

The tests cannot run without a properly configured database connection. The error indicates:

```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"
```

This is because the `prisma+postgres://` protocol requires the Prisma Postgres service to be running.

## Alternative: Use Standard PostgreSQL

To use a standard PostgreSQL database instead:

1. Update `.env` with a standard PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/lahras_life_test?schema=public"
   ```

2. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Run tests:
   ```bash
   npm test -- src/test/integration/user-workflows.test.ts
   ```

## Test Coverage

All tests include:
- Proper cleanup in `beforeEach` hooks
- 30-second timeouts for database operations
- Error handling for database connection issues
- Comprehensive assertions for data integrity
- Foreign key constraint verification

## Next Steps

1. Set up database connection (Prisma Postgres or standard PostgreSQL)
2. Run database migrations
3. Execute integration tests
4. Verify all workflows pass
5. Proceed to Task 16: Final Checkpoint
