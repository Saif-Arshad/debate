import { useState } from "react";
import {
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    Award,
    Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Loader from "@/components/loader";

export const ContributionCard = ({
    contribution,
    onReact,
    user,
    onRemove,
    onGiveAward,
    isTeacherView = false,
}) => {
    console.log("🚀 ~ contribution:", contribution);
    const [userReaction, setUserReaction] = useState(null);
    const [isLiking, setIsLiking] = useState(false);
    const [isDisliking, setIsDisliking] = useState(false);

    const handleReaction = async (reaction) => {
        if (reaction === "like") {
            setIsLiking(true);
        } else if (reaction === "dislike") {
            setIsDisliking(true);
        }
        setUserReaction(userReaction === reaction ? null : reaction);

        // Call the onReact callback if provided
        onReact?.(contribution.id, reaction);

        setTimeout(() => {
            if (reaction === "like") {
                setIsLiking(false);
            } else if (reaction === "dislike") {
                setIsDisliking(false);
            }
        }, 500);
    };

    const getInitials = (name) => {
        if (!name) return "??";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2);
    };

    const sideColors = {
        For: "bg-debate-green text-white",
        Against: "bg-debate-red text-white",
        Neutral: "bg-gray-500 text-white",
    };
    const defaultSideColor = "bg-debate-purple text-white";
    const sideColor = sideColors[contribution.side] || defaultSideColor;

    const getAvatarColor = (userId) => {
        const colors = [
            "bg-debate-blue",
            "bg-debate-red",
            "bg-debate-green",
            "bg-debate-yellow",
            "bg-debate-purple",
        ];
        let index = 0;
        if (userId) {
            const safeInt = parseInt(userId.substring(0, 8), 16);
            if (!isNaN(safeInt)) {
                index = safeInt % colors.length;
            }
        }
        return colors[index];
    };

    const authorName = contribution.authorName || "Unknown Author";
    const avatarColor = getAvatarColor(contribution.authorId);
    const initials = getInitials(authorName);

    return (
        <Card
            className={cn(
                "transition-all duration-300 my-5 animate-slide-in",
                contribution.isHighlighted &&
                "border-debate-yellow shadow-[0_0_10px_rgba(255,209,102,0.5)]"
            )}
        >
            <CardHeader className="pb-2 flex flex-col sm:flex-row items-start gap-3">
                <Avatar className={cn("h-8 w-8", avatarColor)}>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <>
                        <span className="font-semibold text-sm">
                            {authorName}
                            {contribution.isTeacher && (
                                <Badge variant="outline" className="ml-2 text-xs py-0">
                                    Teacher
                                </Badge>
                            )}
                        </span>
                        <Badge variant="outline" className={cn("text-xs py-0", sideColor)}>
                            {contribution.side}
                        </Badge>
                        </>

                        {contribution.awards && contribution.awards.length > 0 && (
                            <div
                                className="flex items-center border-none text-xs py-0"
                            >
                                <Award className="h-5 w-5 mr-1 text-yellow-400" />
                                {contribution.awards[0]}
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {contribution.timestamp
                            ? new Date(contribution.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : ""}
                    </p>
                </div>

                {(isTeacherView && user.id != contribution.authorId ) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                aria-label="More options"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onGiveAward?.(contribution.id)}
                            >
                                <Award className="h-4 w-4 mr-2" />
                                Give Award
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                onClick={() => onRemove(contribution.authorId)}
                            className="text-destructive focus:text-destructive">
                                <Flag className="h-4 w-4 mr-2" />
                                Remove Student
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </CardHeader>

            <CardContent className="py-2">
                <p className="text-sm">{contribution.content}</p>
            </CardContent>

            <CardFooter className="pt-1 pb-2 flex justify-between">
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 px-2 text-muted-foreground",
                            userReaction === "like" && "text-debate-blue"
                        )}
                        onClick={() => handleReaction("like")}
                    >
                        {isLiking ? (
                            <Loader />
                        ) : (
                            <>
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                <span className="text-xs">{contribution.likes || 0}</span>
                            </>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 px-2 text-muted-foreground",
                            userReaction === "dislike" && "text-debate-red"
                        )}
                        onClick={() => handleReaction("dislike")}
                    >
                        {isDisliking ? (
                            <Loader />
                        ) : (
                            <>
                                <ThumbsDown className="h-4 w-4 mr-1" />
                                <span className="text-xs">{contribution.dislikes || 0}</span>
                            </>
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};
