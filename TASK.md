# PlanYMeal Implementation Tasks

## Project Analysis Summary

**Current State:** Demo blog application with user authentication and post management
**Target State:** Meal planning application with menu management, weekly calendar, and shopping list generation

## Phase 1: Remove Blog Features

### 1.1 Database Schema Migration ✅
- [x] **Remove Post model** from `prisma/schema.prisma`
- [x] **Create MenuItem model** with fields: id, userId, name, image, description, rating
- [x] **Create Ingredient model** with fields: id, userId, menuItemId, name, amount, unit
- [x] **Create DayPlan model** with fields: id, userId, date, menuItemId
- [x] **Create ShoppingList model** with fields: id, userId, ingredients (JSON), isCompleted, createdAt
- [x] **Run database migration** to apply schema changes

### 1.2 Remove Blog Components ✅
- [x] **Delete `/app/posts/` directory** (contains all blog-related pages)
- [x] **Delete `/components/post.tsx`** (blog post component)
- [x] **Remove blog actions** from `/app/actions.ts`
- [x] **Clean up imports** referencing deleted components

### 1.3 Update Navigation & Layout ✅
- [x] **Modify `/app/page.tsx`** to remove blog references and "Superblog" branding
- [x] **Update app title** from "Superblog" to "PlanYMeal" in layout and metadata
- [x] **Remove post-related navigation** from header/layout components

## Phase 2: Implement Core Menu Management

### 2.1 Menu Models & API ✅
- [x] **Create `/app/api/menu-items/route.ts`** for GET (with pagination) and POST endpoints
- [x] **Create `/app/api/menu-items/[id]/route.ts`** for GET, PUT, DELETE individual menus
- [x] **Implement menu CRUD operations** with proper user authorization
- [ ] **Add image upload handling** for menu photos (basic URL support implemented)
- [x] **Implement rating system** (1-5 stars) for menus

### 2.2 Menu Components ✅
- [x] **Create `/components/menu-item.tsx`** for displaying individual menu cards
- [x] **Create `/components/menu-form.tsx`** for creating/editing menus
- [x] **Create `/components/ingredient-form.tsx`** for managing ingredients within menus
- [x] **Create `/components/rating-stars.tsx`** for star rating display and input

### 2.3 Menu Pages ✅
- [x] **Create `/app/menus/page.tsx`** for menu list with pagination
- [x] **Create `/app/menus/new/page.tsx`** for creating new menus
- [x] **Create `/app/menus/[id]/edit/page.tsx`** for editing existing menus
- [x] **Create `/app/menus/[id]/page.tsx`** for viewing menu details

## Phase 3: Weekly Calendar Implementation

### 3.1 Calendar Components
- [ ] **Create `/components/week-calendar.tsx`** for 7-day calendar grid
- [ ] **Create `/components/day-card.tsx`** for individual day containers
- [ ] **Implement drag-and-drop functionality** using React DnD or similar
- [ ] **Add week navigation** (previous/next week buttons)
- [ ] **Display current week** starting from today

### 3.2 Calendar API & State
- [ ] **Create `/app/api/week-plan/route.ts`** for GET week plan
- [ ] **Create `/app/api/week-plan/day/route.ts`** for POST (assign menu to day)
- [ ] **Create `/app/api/week-plan/day/[date]/route.ts`** for DELETE (remove menu from day)
- [ ] **Implement week plan state management** (Context or Zustand)

### 3.3 Calendar Integration
- [ ] **Add menu assignment logic** to calendar days
- [ ] **Implement quick-assign** (double-click menu assigns to next free day)
- [ ] **Add visual feedback** for drag operations and hover states

## Phase 4: Shopping List Generation

### 4.1 Shopping List Logic
- [ ] **Create ingredient aggregation function** to sum quantities by ingredient name
- [ ] **Implement unit conversion** for different measurement units
- [ ] **Add alphabetical sorting** for ingredient list
- [ ] **Create shopping list generation API** endpoint

### 4.2 Shopping List Components
- [ ] **Create `/components/shopping-list.tsx`** for displaying generated list
- [ ] **Create `/components/shopping-list-item.tsx`** with checkbox functionality
- [ ] **Implement checklist state management** (localStorage + database sync)
- [ ] **Add hide-completed toggle** functionality

### 4.3 Shopping List Pages & API
- [ ] **Create `/app/api/shopping-list/route.ts`** for GET/POST shopping lists
- [ ] **Create `/app/api/shopping-list/[id]/route.ts`** for updating list status
- [ ] **Create shopping list modal/dialog** accessible from calendar
- [ ] **Add save functionality** for shopping lists

## Phase 5: Internationalization (i18n)

### 5.1 i18n Setup
- [ ] **Install and configure next-intl** or similar i18n library
- [ ] **Create translation files** for German (de) and English (en)
- [ ] **Set up language detection** based on browser preference
- [ ] **Implement language switcher** component in header

### 5.2 Content Translation
- [ ] **Translate all UI text** (buttons, labels, headings)
- [ ] **Localize date formatting** for different locales
- [ ] **Localize number formatting** for ingredient quantities
- [ ] **Add RTL support** considerations for future expansion

## Phase 6: UI/UX Implementation

### 6.1 Layout Structure
- [ ] **Implement two-column layout** (calendar left, menus right)
- [ ] **Add responsive breakpoints** for mobile/tablet views
- [ ] **Create header component** with language selector and logout
- [ ] **Implement sticky header** with backdrop blur effect

### 6.2 Styling & Design
- [ ] **Update Tailwind configuration** for PlanYMeal theme colors
- [ ] **Create design system components** (buttons, cards, modals)
- [ ] **Implement dark mode support** (optional enhancement)
- [ ] **Add loading states** and skeleton components

### 6.3 User Experience
- [ ] **Add confirmation dialogs** for delete operations
- [ ] **Implement toast notifications** for success/error feedback
- [ ] **Add keyboard shortcuts** for power users
- [ ] **Optimize performance** with React.memo and useMemo where needed

## Phase 7: Data Management & Security

### 7.1 User Data Isolation
- [ ] **Ensure all queries filter by userId** for data security
- [ ] **Add middleware protection** for API routes
- [ ] **Implement proper error handling** for unauthorized access
- [ ] **Add input validation** for all forms and API endpoints

### 7.2 Database Optimizations
- [ ] **Add database indexes** for frequently queried fields
- [ ] **Implement connection pooling** for production environment
- [ ] **Add data seeding** for development and testing

## Phase 8: Testing & Quality Assurance

### 8.1 Unit Testing
- [ ] **Write tests for utility functions** (ingredient aggregation, date formatting)
- [ ] **Test API endpoints** with different user scenarios
- [ ] **Test React components** with React Testing Library
- [ ] **Add TypeScript strict mode** checks

### 8.2 Integration Testing
- [ ] **Test complete user workflows** (create menu → plan week → generate list)
- [ ] **Test drag-and-drop functionality** across different browsers
- [ ] **Test responsive design** on various screen sizes
- [ ] **Perform accessibility audit** (ARIA labels, keyboard navigation)

## Phase 9: Production Preparation

### 9.1 Performance Optimization
- [ ] **Implement lazy loading** for menu images
- [ ] **Add image optimization** (next/image configuration)
- [ ] **Optimize bundle size** (analyze and tree-shake unused code)

### 9.3 Documentation
- [ ] **Update README.md** with installation and usage instructions
- [ ] **Create API documentation** with OpenAPI 3.0 specification
- [ ] **Document component props** with TypeScript interfaces
- [ ] **Add inline code comments** for complex logic

## Technical Requirements Met

✅ **Framework:** Next.js with TypeScript  
✅ **Database:** PostgreSQL with Prisma ORM  
✅ **Authentication:** NextAuth.js with GitHub OAuth  
✅ **Styling:** Tailwind CSS  
✅ **Responsive:** Mobile-first approach  
✅ **API:** RESTful with proper CORS  
