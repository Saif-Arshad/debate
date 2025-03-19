// AwardDialog.js
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Award, Star, Trophy, ThumbsUp, Heart, LightbulbIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/loader";
import socket from "@/components/socket";
export const AwardDialog = ({ isOpen, onClose, onAward, contributionId }) => {
    const [selectedAward, setSelectedAward] = useState("Outstanding Contribution");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const awards = [
        { id: "outstanding", name: "Outstanding Contribution", icon: Trophy },
        { id: "insightful", name: "Most Insightful", icon: LightbulbIcon },
        { id: "persuasive", name: "Most Persuasive", icon: ThumbsUp },
        { id: "impactful", name: "Most Impactful", icon: Star },
        { id: "supportive", name: "Most Supportive", icon: Heart },
    ];

    const handleSubmit = () => {
        if (!selectedAward) {
            toast({
                title: "Error",
                description: "Please select an award",
                variant: "destructive",
            });
            return;
        }
        setIsSubmitting(true);
        // Emit award event via socket
        socket.emit("awardContribution", { contributionId, award: selectedAward }, () => {
            console.log("🚀 ~ socket.emit ~ selectedAward:", selectedAward)
            console.log("🚀 ~ socket.emit ~ contributionId:", contributionId)
            setIsSubmitting(false);
            onAward(contributionId, selectedAward);
            onClose();
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-debate-yellow" />
                        Give an Award
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Recognize this contribution with an award. This will be visible to all participants.
                    </p>
                    <RadioGroup value={selectedAward} onValueChange={setSelectedAward} className="space-y-2">
                        {awards.map((award) => (
                            <div
                                key={award.id}
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                                onClick={() => setSelectedAward(award.name)}
                            >
                                <RadioGroupItem value={award.name} id={award.id} />
                                <Label htmlFor={award.id} className="flex items-center gap-2 cursor-pointer">
                                    <award.icon className="h-4 w-4 text-debate-yellow" />
                                    <span>{award.name}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>
                        {isSubmitting ? <Loader /> : "Give Award"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
