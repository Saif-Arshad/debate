import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Loader from "@/components/loader";

export const ContributionForm = ({ onSubmit, userSide }) => {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [raiseHand, setRaiseHand] = useState(false);

    const sideColors = {
        For: "bg-debate-green text-white",
        Against: "bg-debate-red text-white",
        Neutral: "bg-gray-500 text-white",
    };
    const defaultSideColor = "bg-debate-purple text-white";
    const sideColor = sideColors[userSide] || defaultSideColor;

    // When user hits "Submit"
    const handleSubmit = () => {
        if (!content.trim()) {
            toast.error("Please enter a message");
            return;
        }
        setIsSubmitting(true);

        // We'll pass an "ack" callback so that once the server is done, we reset.
        onSubmit(content, raiseHand, () => {
            // Called when the socket server responds
            setContent("");
            setRaiseHand(false);
            setIsSubmitting(false);
        });
    };

    return (
        <Card className="border shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn("text-xs", sideColor)}>{userSide}</Badge>
                </div>
                <Textarea
                    placeholder="Share your thoughts on this debate..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[100px] resize-none"
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            handleSubmit();
                        }
                    }}
                />
                <p className="text-xs text-muted-foreground mt-1">
                    Press Ctrl+Enter to submit
                </p>
            </CardContent>

            <CardFooter className="flex justify-end items-center border-t px-4 py-2 bg-muted/30">
                {/* <Button
                    variant={raiseHand ? "default" : "outline"}
                    size="sm"
                    className={cn(
                        "gap-1",
                        raiseHand
                            ? "bg-debate-blue"
                            : "hover:bg-debate-blue/10 hover:text-debate-blue"
                    )}
                    onClick={() => setRaiseHand(!raiseHand)}
                >
                    {raiseHand ? "Hand Raised" : "Raise Hand"}
                </Button> */}

                <Button
                    onClick={handleSubmit}
                    size="sm"
                    disabled={isSubmitting || !content.trim()}
                >
                    {isSubmitting ? (
                        <Loader />
                    ) : (
                        <>
                            <SendHorizontal className="h-4 w-4" />
                            Submit
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};
