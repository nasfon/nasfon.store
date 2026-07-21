import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <Card className="mt-6 max-w-lg">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-200" />
            <div>
              <p className="font-medium text-gray-900">Customer Name</p>
              <p className="text-sm text-gray-500">customer@email.com</p>
            </div>
          </div>
          <hr />
          <Input id="full-name" label="Full Name" defaultValue="Customer Name" />
          <Input id="email" label="Email" type="email" defaultValue="customer@email.com" />
          <Input id="phone" label="Phone Number" type="tel" defaultValue="" />
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
