"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../view-models/session/session-context";

export default function RootPage() {
  const { user, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role === "COMMERCIAL_ANALYST") {
      router.replace("/campaigns");
    } else if (user.role === "APPROVER_MANAGER") {
      router.replace("/approvals");
    }
  }, [user, isLoading, router]);

  return null;
}
