import { ShieldCheck, Package, HeadphonesIcon, RotateCcw } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    label: "Secure Payment",
    description: "Bank transfer via verified accounts",
  },
  {
    icon: Package,
    label: "Genuine Products",
    description: "100% authentic phone accessories",
  },
  {
    icon: HeadphonesIcon,
    label: "24/7 Support",
    description: "We're here to help anytime",
  },
  {
    icon: RotateCcw,
    label: "Easy Returns",
    description: "Hassle-free return policy",
  },
];

export function TrustBadge() {
  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex flex-col items-center gap-1.5 text-center">
            <div className="rounded-full bg-primary/10 p-2">
              <Icon size={22} className="text-primary" />
            </div>
            <span className="text-xs font-medium text-gray-900">{item.label}</span>
            <span className="text-[11px] text-gray-500">{item.description}</span>
          </div>
        );
      })}
    </div>
  );
}
