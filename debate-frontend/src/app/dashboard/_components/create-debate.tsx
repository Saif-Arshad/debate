"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateDebateProps {
    onDebateCreated: (debate: any) => void;
}

export const CreateDebate = ({ onDebateCreated }: CreateDebateProps) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [sides, setSides] = useState(["For", "Against"]);
    const [newSide, setNewSide] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleAddSide = () => {
        if (!newSide.trim()) return;
        setSides([...sides, newSide.trim()]);
        setNewSide("");
    };

    const handleRemoveSide = (index: number) => {
        setSides(sides.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Please provide a name for the debate",
                variant: "destructive",
            });
            return;
        }

        if (sides.length < 2) {
            toast({
                title: "Error",
                description: "Please add at least two sides to the debate",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        const newDebate = {
            // Use a temporary id; real id will be returned by the API.
            id: Date.now().toString(),
            name: name.trim(),
            description: description.trim(),
            sides,
            createdAt: new Date().toISOString(),
            status: "active",
            participants: 0,
            contributions: 0,
        };

        try {
            await onDebateCreated(newDebate);
            toast({
                title: "Success",
                description: "Debate created successfully!",
            });
            setOpen(false);
            setName("");
            setDescription("");
            setSides(["For", "Against"]);
        } catch (error) {
            console.error("Error creating debate", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 rounded-full">
                    <PlusCircle className="h-4 w-4" />
                    New Debate
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] animate-scale-in">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Create a New Debate
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Debate Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Should AI replace human jobs?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Provide context and information about the debate topic"
                            className="min-h-[100px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label>Debate Sides</Label>
                        <div className="flex flex-wrap gap-2">
                            {sides.map((side, index) => (
                                <div
                                    key={index}
                                    className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
                                >
                                    <span>{side}</span>
                                    <button
                                        type="button"
                                        className="text-muted-foreground hover:text-destructive flex items-center justify-center rounded-full"
                                        onClick={() => handleRemoveSide(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add new side"
                                value={newSide}
                                onChange={(e) => setNewSide(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAddSide()}
                            />
                            <Button type="button" variant="outline" onClick={handleAddSide}>
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button disabled={loading} onClick={handleCreate}>
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Create Debate"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
