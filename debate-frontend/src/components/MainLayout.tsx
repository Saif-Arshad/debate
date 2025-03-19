
import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useUser } from "@/hooks/userSession";

interface MainLayoutProps {
    children: ReactNode;
    className?: string;
}

export const MainLayout = ({ children, className }: MainLayoutProps) => {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const [user, setUser] = useState<any>()
    const { user: userData, logoutUser } = useUser()
    console.log("🚀 ~ Dashboard ~ user:", user)
    useEffect(() => {
        setUser(userData)
    }, [userData])
    const handleLogout = () => {
        logoutUser()
        setUser({})
        window.location.pathname = "/login"
    }
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="h-16 shrink-0 border-b flex items-center px-6 sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                <div className="w-full max-w-screen-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center font-extrabold font-serif gap-8">
                        Debate

                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 p-1 pr-2 rounded-full">
                                        <Avatar className="h-8 w-8 border">
                                            <AvatarFallback className="bg-primary text-primary-foreground">
                                                {getInitials(user.name ?? '')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium hidden sm:inline"> {user.name}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem className="flex gap-2 py-2">
                                        <User className="h-4 w-4" />
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{user.userType ?? ''}</p>
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer">
                                        <div
                                            className="flex items-center"
                                            onClick={handleLogout}

                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Log out
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="default" asChild>
                                <a href="/login">Sign In</a>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <main className={cn("flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-6", className)}>
                {children}
            </main>


        </div>
    );
};
