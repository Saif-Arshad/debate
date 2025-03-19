"use client";

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { MainLayout } from "@/components/MainLayout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CreateDebate } from "./create-debate";
import { DebateCard } from "./debate-card";

export const Loader = () => (
    <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
);

export interface Debate {
    id: string;
    name: string;
    discription: string;
    sides: string[];
    status: string;
    createdAt: string;
    participants: number;
    contributions: number;
}

function Dashboard() {
    const [debates, setDebates] = useState<Debate[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch all debates from the API
    const getAllDebates = async () => {
        try {
            setLoading(true);
            const token = Cookies.get("debate-token");
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/debate/`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDebates(response.data.data);
        } catch (error) {
            console.error("Error fetching debates", error);
        } finally {
            setLoading(false);
        }
    };

    // Create a new debate and update local state
    const handleCreateDebate = async (newDebateData: any) => {
        try {
            const token = Cookies.get("debate-token");
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/debate/`,
                newDebateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            getAllDebates()
        } catch (error) {
            console.error("Error creating debate", error);
        }
    };

    // Delete debate API handler
    const handleDeleteDebate = async (debateId: string) => {
        try {
            const token = Cookies.get("debate-token");
            await axios.delete(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/debate/${debateId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDebates((prev) => prev.filter((d) => d.id !== debateId));
        } catch (error) {
            console.error("Error deleting debate", error);
        }
    };

    useEffect(() => {
        getAllDebates();
    }, []);

    const filteredDebates = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        return debates.filter(
            (debate) =>
                (debate.name?.toLowerCase() || '').includes(lowerQuery) ||
                (debate.discription?.toLowerCase() || '').includes(lowerQuery)
        );
    }, [debates, searchQuery]);

    return (
        <MainLayout>
            <header className="flex flex-col gap-6 mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Debate Dashboard</h1>
                    <p className="text-muted-foreground">
                        Create, manage, and analyze interactive debate sessions for your students.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search debates..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <CreateDebate onDebateCreated={handleCreateDebate} />
                    </div>
                </div>
            </header>

            {loading ? (
                <Loader />
            ) : filteredDebates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4 gap-4 mb-8">
                    {filteredDebates.map((debate) => (
                        <DebateCard
                            key={debate.id}
                            debate={debate}
                            onDelete={handleDeleteDebate}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">No debates found.</div>
            )}
        </MainLayout>
    );
}

export default Dashboard;
