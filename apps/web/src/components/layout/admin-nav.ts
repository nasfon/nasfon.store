import { LayoutDashboard, Package, Grid3X3, ShoppingCart, Users, MapPin, BarChart3, Settings, Store } from "lucide-react";

export const adminNavLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Grid3X3 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/sellers", label: "Sellers", icon: Store },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/delivery-locations", label: "Delivery Locations", icon: MapPin },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];