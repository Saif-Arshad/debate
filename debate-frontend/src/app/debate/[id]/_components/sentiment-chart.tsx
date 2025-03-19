import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SideDistributionChart = ({ data }:any) => {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Side Distribution Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No data available</p>
                </CardContent>
            </Card>
        );
    }

    // Extract side names from the first data point (all points should have the same sides)
    const sides = Object.keys(data[0]).filter(key => key !== 'time');

    // Define a palette of colors for the lines
    const colors = ['#06D6A0', '#EF476F', '#4361EE', '#FFD166', '#118AB2', '#073B4C'];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Side Distribution Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis
                                dataKey="time"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value, name) => [`${value}%`, name]}
                            />
                            <Legend />
                            {sides.map((side, index) => (
                                <Line
                                    key={side}
                                    type="monotone"
                                    dataKey={side}
                                    name={side}
                                    stroke={colors[index % colors.length]}
                                    strokeWidth={2}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export { SideDistributionChart };