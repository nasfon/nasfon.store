import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("Run with: npx tsx --env-file=.env.local scripts/seed-admin.ts");
  process.exit(1);
}

const adminEmail = process.argv[2] || "admin@nasfonstore.com";
const adminPassword = process.argv[3] || "Admin123!";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  console.log(`Creating admin user: ${adminEmail}`);

  const { data: existingUsers, error: listError } = await supabase
    .from("users")
    .select("id")
    .eq("email", adminEmail)
    .eq("role", "admin")
    .maybeSingle();

  if (listError) {
    console.error("Error checking existing admin:", listError.message);
    process.exit(1);
  }

  if (existingUsers) {
    console.log("Admin user already exists. Skipping.");
    process.exit(0);
  }

  const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  if (createError) {
    console.error("Failed to create auth user:", createError.message);
    process.exit(1);
  }

  if (!authUser.user) {
    console.error("No user returned from auth creation");
    process.exit(1);
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: authUser.user.id,
    full_name: "Admin",
    email: adminEmail,
    role: "admin",
  });

  if (insertError) {
    console.error("Failed to insert admin record:", insertError.message);
    await supabase.auth.admin.deleteUser(authUser.user.id);
    process.exit(1);
  }

  console.log(`Admin user created successfully:`);
  console.log(`  Email: ${adminEmail}`);
  console.log(`  Password: ${adminPassword}`);
  console.log(`  Role: admin`);
}

seedAdmin();
