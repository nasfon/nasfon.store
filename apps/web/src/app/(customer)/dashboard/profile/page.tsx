"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { toast } from "sonner";

function ProfileForm({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>["data"]> }) {
  const updateProfile = useUpdateProfile();

  const [fullName, setFullName] = useState(profile.full_name || "");
  const [phone, setPhone] = useState(profile.phone_number || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { full_name: fullName, phone_number: phone },
      {
        onSuccess: () => toast.success("Profile updated"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={profile.email || ""}
          disabled
        />
        <Input
          id="full_name"
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          id="phone"
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Button type="submit" loading={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return <ProfileForm key={profile?.id} profile={profile!} />;
}
