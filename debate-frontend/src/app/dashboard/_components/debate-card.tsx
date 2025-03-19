"use client";

import { BarChart3, Share2, Users, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import Link from "next/link";

export const DebateCard = ({ debate, onDelete }: any) => {
    console.log("🚀 ~ DebateCard ~ debate:", debate)
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const statusColors: any = {
        active: "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400",
        completed:
            "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
        draft:
            "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    };

    const handleCopyJoinCode = () => {
        navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE}/debate/${debate.id}?newjoin=true`);
        toast.success("Join code copied to clipboard");
    };

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(debate.id);
        setDeleting(false);
    };

    return (
        <Card className="card-hover overflow-hidden border relative">
            <button
                onClick={handleDelete}
                disabled={deleting}
                className="absolute top-2 right-2 text-red-500 z-10"
                title="Delete Debate"
            >
                {deleting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Trash size={16} />
                )}
            </button>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-xl line-clamp-1">{debate.name}</CardTitle>
                    <Badge className={statusColors[debate.status]} variant="outline">
                        {debate.status.charAt(0).toUpperCase() + debate.status.slice(1)}
                    </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                    {debate.discription || "No description provided"}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                    {debate.sides.map((side: any, index: any) => (
                        <Badge key={index} variant="secondary" className="text-xs font-normal">
                            {side}
                        </Badge>
                    ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        {/* <Users className="h-3.5 w-3.5" /> */}
                        {/* <span>{debate.participents.length} participants</span> */}
                    </div>
                    <div className="flex items-center gap-1">
                        <span>{new Date(debate.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/40 pt-3 pb-3 flex justify-between gap-2">
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Share2 className="h-3.5 w-3.5" />
                            Share
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md animate-scale-in">
                        <DialogHeader>
                            <DialogTitle>Share Debate Session</DialogTitle>
                        </DialogHeader>
                        <div className="py-6">
                            <div className="space-y-4">
                                <div className="flex flex-col items-center justify-center">
                                    <p className="text-sm text-muted-foreground">
                                        Share this code with your students to join the debate
                                    </p>
                                </div>
                                <div className="flex justify-center gap-2 pt-4">
                                    <Button variant="outline" onClick={handleCopyJoinCode}>
                                        Copy Code
                                    </Button>
                                    <Link href={`/debate/${debate.id}`}>

                                        <Button
                                        >
                                            Open Debate
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-center">
                            <DialogClose asChild>
                                <Button variant="ghost">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Link href={`/debate/${debate.id}`}>
                    <Button
                        variant="default"
                        size="sm"
                    >
                        Open Debate
                    </Button>
                </Link>
            </CardFooter>
        </Card >
    );
};
