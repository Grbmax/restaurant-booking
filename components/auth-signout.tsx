"use client"
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";


const AuthSignOut = () => {
    const handleLogout = () => {
        signOut();
    }

    return ( 
        <Button variant="destructive" onClick={handleLogout}>Sign Out</Button>
     );
}
 
export default AuthSignOut;