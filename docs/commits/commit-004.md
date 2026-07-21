# Commit 004

**Message:** Add design system UI components, layout, and shared components

**Date:** 2026-07-21

---

## Files Created

### Core UI Components (`src/components/ui/`)
| File | Purpose |
|------|---------|
| `button.tsx` | Button — Primary, Secondary, Outline, Text variants with sm/md/lg sizes |
| `input.tsx` | Text input with label, error state |
| `textarea.tsx` | Textarea with label, error state |
| `select.tsx` | Dropdown select with options, placeholder, label, error |
| `badge.tsx` | Badge — default, success, warning, error, info, primary variants |
| `card.tsx` | Card, CardHeader, CardContent |
| `modal.tsx` | Modal dialog with backdrop, escape key close |
| `skeleton.tsx` | Loading skeleton placeholder |
| `spinner.tsx` | Loading spinner (Lucide Loader2) |
| `empty-state.tsx` | Empty state with icon, title, description, action |
| `alert.tsx` | Alert — success, warning, error, info variants |
| `index.ts` | Re-exports for clean imports |

### Layout Components (`src/components/layout/`)
| File | Purpose |
|------|---------|
| `navbar.tsx` | Top navigation — logo, search, categories, cart, profile |
| `bottom-nav.tsx` | Mobile bottom navigation — Home, Categories, Search, Cart, Profile |
| `footer.tsx` | Footer — company info, policies, support links |

### Shared Components (`src/components/shared/`)
| File | Purpose |
|------|---------|
| `product-card.tsx` | Product card with image, name, price, stock, add to cart |
| `trust-badge.tsx` | Trust signals — secure payment, genuine products, 24/7 support, returns |
| `order-timeline.tsx` | Order status timeline with icons |

### Other
- Added `Toaster` (sonner) to root layout
- Installed `class-variance-authority` for variant management
