import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type Point = { x: number; y: number };

interface Props {
  data: Point[];
}

function formatNum(v: number) {
  return v.toFixed(3);
}

export default function TrajectoryChart({ data }: Props) {
  const maxY = Math.max(...data.map((p) => p.y));
  const peakPoint = data.find((p) => p.y === maxY);

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 16, right: 32, left: 16, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="x"
            type="number"
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{ value: "X (m)", position: "insideBottomRight", offset: -8, fill: "#94a3b8" }}
            stroke="#475569"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{ value: "Y (m)", angle: -90, position: "insideLeft", offset: 8, fill: "#94a3b8" }}
            stroke="#475569"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#94a3b8", fontSize: 12 }}
            itemStyle={{ color: "#38bdf8" }}
            formatter={(value) => [formatNum(Number(value)), ""]}
            labelFormatter={(label) => `X: ${formatNum(Number(label))} m`}
          />
          {peakPoint && (
            <ReferenceLine
              x={peakPoint.x}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: `Apice Y=${formatNum(peakPoint.y)}`, fill: "#f59e0b", fontSize: 11 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="y"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#38bdf8" }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <StatCard label="Punti" value={String(data.length)} />
        <StatCard label="Gittata X" value={`${formatNum(data[data.length - 1]?.x ?? 0)} m`} />
        <StatCard label="Altezza max" value={`${formatNum(maxY)} m`} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-semibold text-sky-400 mt-1">{value}</p>
    </div>
  );
}
