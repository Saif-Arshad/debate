import { useState, useEffect, useRef, useMemo } from "react";
import socket from "../../../../components/socket";
import { ContributionCard } from "./contribution-card";
import { ContributionForm } from "./contribution-form";
import { StudentJoin } from "./student-join";
import { AwardDialog } from "./award-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useUser } from "@/hooks/userSession";
import Loader from "@/components/loader";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const DebatePage = ({ debate }) => {
    const [debateData, setDebateData] = useState(debate);
    const [contributions, setContributions] = useState([]);
    const [isTeacher, setIsTeacher] = useState(false);
    const [studentJoinOpen, setStudentJoinOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [isRemoved, setIsRemoved] = useState(false);
    const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
    const [selectedContribution, setSelectedContribution] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeMobileTab, setActiveMobileTab] = useState('contributions'); // Mobile tab state

    const contributionsEndRef = useRef(null);
    const { user: authUser } = useUser();

    const filteredContributions = useMemo(() => {
        return contributions.filter((c) => !debateData.removeUsers?.includes(c.authorId));
    }, [contributions, debateData.removeUsers]);

    const computedSideDistribution = useMemo(() => {
        if (!filteredContributions.length) return [];
        const groups = {};
        filteredContributions.forEach((c) => {
            const timeBucket = new Date(c.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
            if (!groups[timeBucket]) {
                groups[timeBucket] = { total: 0 };
                debateData.sides.forEach((side) => (groups[timeBucket][side] = 0));
            }
            groups[timeBucket].total += 1;
            if (debateData.sides.includes(c.side)) groups[timeBucket][c.side] += 1;
        });
        return Object.keys(groups)
            .sort()
            .map((time) => {
                const bucket = groups[time];
                const result = { time };
                debateData.sides.forEach((side) => {
                    result[side] = bucket.total > 0 ? Math.round((bucket[side] / bucket.total) * 100) : 0;
                });
                return result;
            });
    }, [filteredContributions, debateData.sides]);

    const overallSideDistribution = useMemo(() => {
        if (!filteredContributions.length) return {};
        const sideCounts = {};
        debateData.sides.forEach((side) => (sideCounts[side] = 0));
        filteredContributions.forEach((c) => {
            if (debateData.sides.includes(c.side)) sideCounts[c.side] += 1;
        });
        const total = filteredContributions.length;
        const result = {};
        debateData.sides.forEach((side) => {
            result[side] = total > 0 ? Math.round((sideCounts[side] / total) * 100) : 0;
        });
        return result;
    }, [filteredContributions, debateData.sides]);

    const debateDuration = useMemo(() => {
        if (!debateData.createdAt) return "";
        const createdAt = new Date(debateData.createdAt);
        const now = new Date();
        const diffMs = now - createdAt;
        const totalMinutes = Math.floor(diffMs / 60000);

        if (totalMinutes < 60) {
            return `${totalMinutes}m`;
        } else {
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
    }, [debateData.createdAt]);

    useEffect(() => {
        socket.emit("joinDebate", debateData.id);
    }, [debateData.id]);

    useEffect(() => {
        socket.on("newContribution", (newContribution) => {
            setContributions((prev) => [...prev, newContribution]);
        });
        socket.on("updateContribution", (updatedContribution) => {
            setContributions((prev) =>
                prev.map((c) => (c.id === updatedContribution.id ? updatedContribution : c))
            );
        });
        return () => {
            socket.off("newContribution");
            socket.off("updateContribution");
        };
    }, []);

    useEffect(() => {
        if (debateData?.contributions) setContributions(debateData.contributions);
        setIsLoading(false);
    }, [debateData]);

    useEffect(() => {
        if (authUser?.userType === "TEACHER") {
            setUser({ id: authUser.id, name: authUser.name || "Teacher", role: "teacher" });
            setIsTeacher(true);
        }
    }, [authUser]);

    useEffect(() => {
        const storedUser = localStorage.getItem("debate-user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.debate === debateData.id) {
                    setUser({
                        id: parsedUser.id,
                        name: parsedUser.Name,
                        role: "student",
                        side: parsedUser.side,
                    });
                }
            } catch (error) {
                console.error("Error parsing debate user:", error);
            }
        }
    }, [debateData]);

    useEffect(() => {
        contributionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [filteredContributions]);

    useEffect(() => {
        socket.on("updateDebate", (updated) => {
            setDebateData(updated);
            if (user?.id && updated.removeUsers?.includes(user.id)) {
                localStorage.setItem("remove", "true");
                setIsRemoved(true);
            }
        });
        return () => socket.off("updateDebate");
    }, [user]);

    useEffect(() => {
        const localRemoved = localStorage.getItem("remove") === "true";
        const userRemoved = user?.id && debateData.removeUsers?.includes(user.id);
        if (localRemoved || userRemoved) setIsRemoved(true);
    }, [debateData, user]);

    const handleStudentJoin = async (userName, name, thought, side) => {
        const payload = { debate: debateData.id, userName, Name: name, firstThought: thought, side };
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/debate/${debateData.id}/join`,
                payload
            );
            setUser({ id: res.data.id, name, role: "student", side });
            localStorage.setItem("debate-user", JSON.stringify({
                id: res.data.id,
                debate: debateData.id,
                Name: res.data.Name,
                side: res.data.side,
            }));
            setStudentJoinOpen(false);
            toast.success(`You've joined the "${side}" side`);
        } catch (error) {
            console.log("Error joining debate:", error);
            toast.error("Failed to join debate. Please try again.");
        }
    };

    const handleSubmitContribution = (content, raiseHand, onAck) => {
        const contributionData = {
            debateId: debateData.id,
            authorName: user?.name || "Anonymous",
            authorId: user?.id,
            side: user?.side || "Neutral",
            content,
        };
        socket.emit("sendContribution", contributionData, (ack) => {
            if (ack?.status !== "ok") toast.error("Failed to submit your contribution");
            onAck();
        });
    };

    const handleReact = (contributionId, reaction) => {
        socket.emit("reactContribution", { contributionId, debateId: debateData.id, reaction });
    };

    const handleOpenAwardDialog = (contributionId) => {
        setSelectedContribution(contributionId);
        setIsAwardDialogOpen(true);
    };

    const handleGiveAward = (contributionId, award) => {
        socket.emit("awardContribution", { contributionId, debateId: debateData.id, award });
        toast.success("Award given successfully!");
    };

    const handleRemove = (removeUserId = user.id) => {
        socket.emit("removeUser", { debateId: debateData.id, userId: removeUserId }, (err, updatedDebate) => {
            if (err) {
                console.error(err);
            } else if (removeUserId === user.id) {
                localStorage.removeItem("debate-user");
                localStorage.setItem("remove", "true");
                setUser(null);
                setIsRemoved(true);
                toast.error("You have been removed from this debate.");
            } else {
                toast.success("User has been removed from the debate.");
            }
        });
    };

    // **Chart Rendering**
    const renderSideDistributionChart = () => {
        const data = computedSideDistribution;
        if (!data.length) {
            return (
                <div className="flex items-center justify-center h-[200px] text-gray-500">
                    No data available for the chart.
                </div>
            );
        }

        const sides = Object.keys(data[0]).filter((key) => key !== "time");
        const colors = ["#8884d8", "#82ca9d", "#ff7300", "#ffbb28", "#00c49f"];
        const sideColors = sides.reduce((acc, side, index) => {
            acc[side] = colors[index % colors.length];
            return acc;
        }, {});

        return (
            <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis label={{ value: "%", position: "insideLeft", offset: -5 }} />
                        <Tooltip
                            formatter={(value, name) => [`${value}%`, name]}
                            labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Legend />
                        {sides.map((side) => (
                            <Line
                                key={side}
                                type="monotone"
                                dataKey={side}
                                stroke={sideColors[side]}
                                strokeWidth={2}
                                dot={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        );
    };

    // **Render Logic**
    if (isRemoved) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <p className="text-xl font-semibold text-gray-800 mb-2">
                        You have been removed from this debate.
                    </p>
                    <p className="text-gray-600">
                        Please contact your teacher for more details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <StudentJoin
                isOpen={studentJoinOpen}
                onClose={() => setStudentJoinOpen(false)}
                onJoin={handleStudentJoin}
                sides={debateData.sides}
                debateName={debateData.name}
            />
            <AwardDialog
                isOpen={isAwardDialogOpen}
                onClose={() => setIsAwardDialogOpen(false)}
                onAward={handleGiveAward}
                contributionId={selectedContribution || ""}
            />

            <div className="flex flex-col h-[calc(100vh-4rem)]">
                <div className="border-b px-4 sm:px-6 bg-background  fixed w-full top-0 z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="text-xl  mt-4 font-mono font-semibold capitalize line-clamp-1">
                                    {debateData.name}
                                </h1>
                                <div className="flex items-center gap-2 pb-2 text-sm text-muted-foreground">
                                    <span>{debateData.user?.name}</span>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-around py-2 bg-gray-100 md:hidden">
                    <button
                        className={`px-4 py-2 rounded-md ${activeMobileTab === 'contributions' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                        onClick={() => setActiveMobileTab('contributions')}
                    >
                        Contributions
                    </button>
                    {isTeacher && (
                        <button
                            className={`px-4 py-2 rounded-md ${activeMobileTab === 'analytics' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                            onClick={() => setActiveMobileTab('analytics')}
                        >
                            Analytics
                        </button>
                    )}
                </div>

                {/* Main Layout */}
                <div className="grid grid-cols-1 pt-20 md:grid-cols-3 gap-0">
                    {/* Contributions */}
                    <div className={`${activeMobileTab === 'contributions' ? 'block' : 'hidden'} md:block md:col-span-2`}>
                        <div className="flex-1 gap-3 overflow-y-auto p-4 sm:p-6">
                            {isLoading ? (
                                <Loader />
                            ) : filteredContributions.length === 0 ? (
                                <Card className="border shadow-sm">
                                    <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                                        <p className="text-lg font-medium py-2">No contributions yet</p>
                                        <p className="text-gray-500 mb-4">
                                            Be the first one to start this exciting debate!
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredContributions.map((c) => {
                                    const contributionData = {
                                        ...c,
                                        authorName: c.authorName ?? "Unknown Author",
                                        authorId: c.authorId ?? "",
                                        likes: c.likes ?? 0,
                                        dislikes: c.dislikes ?? 0,
                                        side: c.side ?? "Neutral",
                                        timestamp: c.timestamp ?? new Date().toISOString(),
                                        awards: c.awards ?? [],
                                    };
                                    return (
                                        <ContributionCard
                                            user={user}
                                            onRemove={handleRemove}
                                            key={contributionData.id}
                                            contribution={contributionData}
                                            onReact={handleReact}
                                            onGiveAward={handleOpenAwardDialog}
                                            isTeacherView={user?.role === "teacher"}
                                        />
                                    );
                                })
                            )}
                            <div ref={contributionsEndRef} />
                        </div>

                        {/* Contribution Form */}
                        <div id="contribution-form" className="max-w-4xl mx-auto pt-6 pb-4">
                            {user ? (
                                <ContributionForm
                                    onSubmit={handleSubmitContribution}
                                    userSide={user.side || "Neutral"}
                                />
                            ) : (
                                <Card className="border shadow-sm">
                                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                                        <p className="mb-4 text-gray-500">
                                            Join the debate to contribute your thoughts and reactions.
                                        </p>
                                        <Button onClick={() => setStudentJoinOpen(true)}>Join Debate</Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>

                    <div className={`${activeMobileTab === 'analytics' ? 'block' : 'hidden'} md:block  md:col-span-1 md:border-l md:overflow-y-auto `}>
                        <Tabs defaultValue="participants" className="w-full">
                            <TabsList className="w-full flex border-b">
                                <TabsTrigger
                                    value="participants"
                                    className="flex-1 text-center py-2 px-4 cursor-pointer bg-gray-50 border-b-2 border-transparent hover:bg-gray-100 data-[state=active]:border-blue-500 data-[state=active]:bg-white"
                                >
                                    Participants
                                </TabsTrigger>
                                {isTeacher && (
                                    <TabsTrigger
                                        value="stats"
                                        className="flex-1 text-center py-2 px-4 cursor-pointer bg-gray-50 border-b-2 border-transparent hover:bg-gray-100 data-[state=active]:border-blue-500 data-[state=active]:bg-white"
                                    >
                                        Stats
                                    </TabsTrigger>
                                )}
                            </TabsList>
                            <TabsContent value="participants" className="p-4 space-y-4">

                            <div>
                                <h3 className="font-medium font-sans mb-2">Participants</h3>
                                <div className="space-y-2">
                                    {debateData.participants
                                        .filter((p) => !debateData.removeUsers?.includes(p.id))
                                        .map((participant) => (
                                            <details
                                                key={participant.id}
                                                className="group border rounded-lg"
                                            >
                                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium capitalize">{participant.Name}</span>
                                                        <span className="text-sm text-muted-foreground">({participant.side})</span>
                                                    </div>
                                                    <svg
                                                        className="w-4 h-4 transition-transform group-open:rotate-180"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </summary>
                                                {participant.firstThought && (
                                                    <div className="p-4 pt-0">
                                                        <div className="bg-muted/50 rounded-md p-3">
                                                            <p className="text-sm text-muted-foreground mb-1">First Thought:</p>
                                                            <p className="text-sm">{participant.firstThought}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </details>
                                        ))}
                                </div>
                            </div>


                                <Separator />
                                <div>
                                    <h3 className="font-medium font-sans mb-2">Participation by Side</h3>
                                    {debateData.sides.map((side) => {
                                        const count = filteredContributions.filter((c) => c.side === side).length;
                                        const percentage = filteredContributions.length > 0
                                            ? Math.round((count / filteredContributions.length) * 100)
                                            : 0;
                                        return (
                                            <div key={side} className="mb-3">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span>{side}</span>
                                                    <span>{percentage}%</span>
                                                </div>
                                                <Progress value={percentage} className="h-2" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                            {isTeacher && (
                                <TabsContent value="stats" className="p-4 space-y-4">
                                    {renderSideDistributionChart()}
                                    <div>
                                        <h3 className="font-medium font-sans mb-3">Debate Insights</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-100 p-3 rounded-md">
                                                <p className="text-xs text-gray-500">Contributions</p>
                                                <p className="text-xl font-semibold">{filteredContributions.length}</p>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-md">
                                                <p className="text-xs text-gray-500">Participants</p>
                                                <p className="text-xl font-semibold">
                                                    {debateData.participants.filter((p) => !debateData.removeUsers?.includes(p.id)).length}
                                                </p>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-md">
                                                <p className="text-xs text-gray-500">Leading Side</p>
                                                <p className="text-xl font-semibold">
                                                    {Object.keys(overallSideDistribution).length > 0
                                                        ? `${Object.entries(overallSideDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[0]} (${Object.entries(overallSideDistribution).reduce((a, b) => a[1] > b[1] ? a : b)[1]}%)`
                                                        : "N/A"}
                                                </p>
                                            </div>
                                            <div className="bg-gray-100 p-3 rounded-md">
                                                <p className="text-xs text-gray-500">Duration</p>
                                                <p className="text-xl font-semibold">{debateDuration}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DebatePage;