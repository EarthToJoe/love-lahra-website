# Manual Testing Checklist

## Critical User Flows to Test

### 1. Authentication Flow ✓
- [x] User can register with email/password
- [x] User can login with correct credentials
- [x] User cannot login with incorrect credentials
- [x] Password show/hide toggle works
- [x] Session persists across page refreshes
- [x] User can logout
- [ ] Password reset flow works (if implemented)

### 2. Comment System
- [ ] User can post a top-level comment
- [ ] Comment appears immediately (optimistic UI)
- [ ] Comment persists after page refresh
- [ ] User can reply to a comment
- [ ] Nested replies display correctly
- [ ] Comment author name displays correctly
- [ ] Comment timestamps are accurate
- [ ] User can like a comment
- [ ] Like count updates correctly
- [ ] User cannot like same comment twice
- [ ] Comments load on all content pages

### 3. Poll System
- [ ] Polls display on polls page
- [ ] User can vote on a poll
- [ ] Vote is recorded in database
- [ ] Results update after voting
- [ ] User cannot vote twice on same poll (if restricted)
- [ ] Poll results display correctly
- [ ] This-or-That polls work correctly

### 4. Admin Panel (requires admin role)
- [ ] Admin can access /admin routes
- [ ] Non-admin users are blocked from /admin
- [ ] Admin can create new content
- [ ] Admin can edit existing content
- [ ] Admin can delete content
- [ ] Admin can moderate comments
- [ ] Admin can manage polls
- [ ] Admin can view donation data
- [ ] Admin settings save correctly

### 5. Content Display
- [ ] Homepage loads correctly
- [ ] All content sections display
- [ ] Images load properly
- [ ] Navigation works between pages
- [ ] Mobile responsive design works
- [ ] Dark/light theme toggle works (if implemented)

### 6. Database Integration
- [ ] All data persists after server restart
- [ ] No mock data is being used
- [ ] Foreign key relationships work
- [ ] Cascade deletes work properly
- [ ] User preferences save correctly

### 7. Real-time Features
- [ ] Socket.io connects successfully
- [ ] Real-time updates work for comments
- [ ] Real-time updates work for polls
- [ ] Notifications appear correctly
- [ ] Notification preferences work

### 8. Error Handling
- [ ] 404 page displays for invalid routes
- [ ] API errors show user-friendly messages
- [ ] Form validation works correctly
- [ ] Network errors are handled gracefully
- [ ] Database errors don't crash the app

### 9. Performance
- [ ] Pages load within 3 seconds
- [ ] Images are optimized/lazy loaded
- [ ] No console errors in browser
- [ ] No memory leaks during navigation
- [ ] Concurrent users don't cause issues

### 10. Security
- [ ] Passwords are hashed in database
- [ ] SQL injection is prevented (Prisma handles this)
- [ ] XSS attacks are prevented
- [ ] CSRF protection is in place
- [ ] Admin routes require authentication
- [ ] User data is properly isolated

## Testing Instructions

Run through each section systematically:

1. Open http://localhost:3000 in browser
2. Open browser DevTools (Console + Network tabs)
3. Test each flow and check for errors
4. Verify database changes in Supabase dashboard
5. Test on different screen sizes (mobile, tablet, desktop)
6. Test in different browsers (Chrome, Firefox, Safari)

## Known Issues to Watch For

- Integration tests have some database setup issues (not affecting production)
- Performance test expects 95% success rate under load
- Some tests may need database connection configuration

## Quick Smoke Test Commands

```bash
# Check for TypeScript errors
npm run build

# Run all tests
npm test -- --run

# Check for linting issues
npm run lint

# Start dev server
npm run dev
```
