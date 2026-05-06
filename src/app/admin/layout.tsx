import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ClearIntro from "@/components/ui/ClearIntro";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  return (
    <>
      <ClearIntro />
      {children}
    </>
  );
}
