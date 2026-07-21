import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
      <Card className="mt-6 max-w-lg">
        <CardContent className="p-4 space-y-4">
          <Input id="support-phone" label="Support Phone" placeholder="Customer support phone number" />
          <Input id="support-email" label="Support Email" type="email" placeholder="Customer support email" />
          <Input id="store-address" label="Store Address" placeholder="Physical store address" />
          <Textarea id="return-policy" label="Return Policy" placeholder="Return policy text..." />
          <Textarea id="privacy-policy" label="Privacy Policy" placeholder="Privacy policy text..." />
          <Textarea id="terms" label="Terms & Conditions" placeholder="Terms and conditions..." />
          <Button>Save Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
