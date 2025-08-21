import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PricingPageClient } from "@/components/pricing-page-client";

export default async function PricingPage() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect("/");
  }

  return <PricingPageClient />;
}