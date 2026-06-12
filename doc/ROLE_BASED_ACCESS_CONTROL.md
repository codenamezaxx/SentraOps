# Role-Based Access Control Implementation

## Overview

SentraOps implements role-based access control (RBAC) to restrict access to certain features based on user roles. The system supports two roles:

- **Owner**: Full access to all features (Dashboard, POS, Inventory, Financial Summary)
- **Cashier**: Limited access (POS and Dashboard only)

## Architecture

The RBAC implementation uses a multi-layered approach:

1. **Middleware Layer**: Server-side route protection at the edge
2. **Component Layer**: Client-side HOC for additional protection
3. **Database Layer**: RLS policies enforce data isolation

## Components

### 1. RequireOwner HOC

**Location**: `src/components/auth/RequireOwner.tsx`

Higher-order component that wraps owner-only pages to enforce authorization at the component level.

**Usage**:
```tsx
import { RequireOwner } from '@/components/auth/RequireOwner'
import { getUserProfile } from '@/lib/supabase/queries'

export default async function InventoryPage() {
  const profile = await getUserProfile()

  return (
    <RequireOwner profile={profile}>
      <div>Owner-only content here</div>
    </RequireOwner>
  )
}
```

**Behavior**:
- Checks if user profile exists and has 'owner' role
- Redirects to `/login` if no profile found
- Redirects to `/access-denied` if user is not an owner
- Shows loading spinner during authorization check
- Renders children only for authorized owners

### 2. Access Denied Page

**Location**: `src/app/access-denied/page.tsx`

User-friendly error page displayed when cashiers attempt to access owner-only features.

**Features**:
- Clear error message in Indonesian
- "Kembali ke Dashboard" button to return to home
- "Buka POS" button to navigate to cashier-accessible POS page
- Mobile-first responsive design
- Consistent with design system (rounded-2xl, zinc/teal colors)

### 3. Middleware Authorization

**Location**: `src/middleware.ts`

Server-side route protection that runs before pages load.

**Owner-Only Routes**:
```typescript
const ownerOnlyRoutes = ['/inventory', '/financial']
```

**Authorization Flow**:
1. Check if request path matches owner-only route
2. If yes, fetch user profile from database
3. Check if user role is 'owner'
4. If not owner, redirect to `/access-denied`
5. If owner, allow request to proceed

**Benefits**:
- Prevents unauthorized access before page renders
- Reduces client-side code execution for unauthorized users
- Provides security at the edge

## Protected Routes

### Owner-Only Routes

| Route | Description |
|-------|-------------|
| `/inventory` | Inventory management - view and update product stock |
| `/financial` | Financial summary - view P&L reports and revenue analytics |

### Cashier-Accessible Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard - limited view of business metrics |
| `/pos` | Point of Sale - process customer transactions |

## Testing

### Unit Tests

**RequireOwner Component Tests**:
- ✅ Renders children when user is owner
- ✅ Redirects to access-denied when user is cashier
- ✅ Redirects to login when profile is null
- ✅ Shows loading state during authorization check

**Middleware Tests**:
- ✅ Owner-only routes configuration is correct
- ✅ Authorization logic for different roles

**Run Tests**:
```bash
npm test -- RequireOwner.test.tsx --run
npm test -- middleware.test.ts --run
```

### Manual Testing Scenarios

1. **Owner Access**:
   - Login as owner
   - Navigate to `/inventory` → Should see inventory page
   - Navigate to `/financial` → Should see financial page
   - Navigate to `/pos` → Should see POS page

2. **Cashier Access**:
   - Login as cashier
   - Navigate to `/inventory` → Should redirect to `/access-denied`
   - Navigate to `/financial` → Should redirect to `/access-denied`
   - Navigate to `/pos` → Should see POS page
   - Click "Kembali ke Dashboard" on access denied page → Should navigate to `/`

3. **Unauthenticated Access**:
   - Logout
   - Navigate to `/inventory` → Should redirect to `/login`
   - Navigate to `/financial` → Should redirect to `/login`

## Security Considerations

### Defense in Depth

The implementation uses multiple layers of protection:

1. **Middleware (Server-side)**: First line of defense, runs on every request
2. **Component (Client-side)**: Additional check at component render time
3. **Database RLS**: Ensures data isolation even if application layer is bypassed

### Why Multiple Layers?

- **Middleware**: Prevents page from loading, saves bandwidth
- **Component HOC**: Type-safe, provides better DX, handles edge cases
- **RLS**: Ultimate security boundary, protects against API misuse

### Performance Considerations

- Middleware adds minimal latency (~10-20ms) for database role check
- Profile query uses index on `auth_id` for fast lookups
- Only runs for authenticated users on owner-only routes

## Design Principles

### User Experience

- **Clear Error Messages**: Indonesian language, explains why access is denied
- **Actionable Options**: Buttons to navigate to accessible pages
- **Loading States**: Shows spinner during authorization check
- **Mobile-First**: Works seamlessly on all device sizes

### Code Quality

- **Type Safety**: Full TypeScript support with Profile interface
- **Testable**: HOC is easily unit tested in isolation
- **Reusable**: RequireOwner can be applied to any page
- **Maintainable**: Owner-only routes defined in single location

## Future Enhancements

Potential improvements for future iterations:

1. **Granular Permissions**: Support for custom role permissions beyond owner/cashier
2. **Permission Caching**: Cache role checks to reduce database queries
3. **Audit Logging**: Log authorization failures for security monitoring
4. **Dynamic Routes**: Support for dynamic route patterns (e.g., `/inventory/:id`)
5. **Role Management UI**: Allow owners to manage user roles through UI

## References

- Requirements 3.2, 3.3 in `requirements.md`
- Property 18 (Authorization Layer Consistency) in `design.md`
- Property 19 (Role-Based Access Denial) in `design.md`
