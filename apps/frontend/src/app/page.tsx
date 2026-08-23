"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLE_HOME_ROUTE } from "@/lib/role-routes";
import { useSession } from "@/view-models/session/session-context";

export default function RootPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role) {
      router.replace(ROLE_HOME_ROUTE[user.role]);
    }
  }, [user, isLoading, router]);

  return null;
}
