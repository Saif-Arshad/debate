"use client";
import { signOut, useSession } from "next-auth/react";

export const useUser = () => {
    const session = useSession();
    console.log("🚀 ~ useUser ~ session:", session)
    const user = session.data?.user
    const logoutUser = async () => {
        document.cookie = "debate-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        await signOut()
    }

    return { user, logoutUser };
}