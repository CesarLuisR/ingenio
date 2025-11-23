import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

interface Props {
    data: any[];
}

export default function HistoryChart({ data }: Props) {
    if (!data || data.length === 0) {
        return <div style={{display:'flex', height: 250, alignItems:'center', justifyContent:'center', color:'#94a3b8'}}>Sin datos históricos</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorAv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} interval={3} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} width={30}/>
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    formatter={(val: number) => [`${val.toFixed(1)}%`, "Disponibilidad"]}
                />
                <Area 
                    type="monotone" 
                    dataKey="availability" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorAv)" 
                    animationDuration={1500}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}