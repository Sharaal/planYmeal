import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AccountPageClient } from "@/components/account-page-client";

export default async function AccountPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/");
  }

  return <AccountPageClient />;
}