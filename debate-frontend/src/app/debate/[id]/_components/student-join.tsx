import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface StudentJoinProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: (username: string, fullName: string, firstThought: string, side: string) => void;
    sides: string[];
    debateName: string;
}

export const StudentJoin = ({
    isOpen,
    onClose,
    onJoin,
    sides,
    debateName,
}: StudentJoinProps) => {
    const [loading,setLoading] = useState(false)
    const [userName, setUserName] = useState("");
    const [fullName, setFullName] = useState("");
    const [firstThought, setFirstThought] = useState("");
    const [side, setSide] = useState<string>("");

    const handleJoin = () => {
        if (!userName.trim()) {
            toast.error("Please enter your username");
            return;
        }
        if (!fullName.trim()) {
            toast.error("Please enter your full name");
            return;
        }
        if (!firstThought.trim()) {
            toast.error("Please enter your first thought");
            return;
        }
        if (!side) {
            toast.error("Please select a side");
            return;
        }
        onJoin(userName, fullName, firstThought, side);
        setLoading(true)
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[450px] animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Join the Debate</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{debateName}</h3>
                        <p className="text-sm text-muted-foreground">
                            Enter your details and choose your side.
                        </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>

                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            placeholder="Enter your username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                            />
                            </div>
                    <div>
                        <Label htmlFor="fullname">Your Name</Label>
                        <Input
                            id="fullname"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            />
                    </div>
                            </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="firstThought">Thought about the Debate</Label>
                        <Input
                            id="firstThought"
                            placeholder="Enter your first thought"
                            value={firstThought}
                            onChange={(e) => setFirstThought(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Select Your Side</Label>
                        <RadioGroup value={side} onValueChange={setSide} className="space-y-1.5">
                            {sides.map((sideName) => (
                                <div key={sideName} className="flex items-center space-x-2">
                                    <RadioGroupItem value={sideName} id={sideName} />
                                    <Label htmlFor={sideName} className="cursor-pointer">
                                        {sideName}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleJoin}>
                        {
                            loading ? "Joining" :"    Join Debate"
                        }
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
