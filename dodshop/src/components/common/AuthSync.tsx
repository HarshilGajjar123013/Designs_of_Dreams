"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";

export default function AuthSync() {
  const user = useStore((state) => state.user);
  const loginAction = useStore((state) => state.login);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    // Verify session with server cookie if Zustand state is not logged in
    if (!user?.isLoggedIn) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            const u = data.user;
            loginAction(u.id, u.email, u.name, u.avatar, u.phone);
          }
        })
        .catch(() => {});
    }
  }, [user?.isLoggedIn, loginAction]);

  return null;
}
