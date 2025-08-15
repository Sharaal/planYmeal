import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MenuForm } from "@/components/menu-form";

export default async function NewMenuPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/");
  }

  return <MenuForm />;
}