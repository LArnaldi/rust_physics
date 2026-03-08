import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

export type Frame = { x: number; y: number; colliding: boolean };
export type BodySnapshot = { x: number; y: number; width: number; height: number };

interface Props {
  frames: Frame[];
  body: BodySnapshot;
  wall: BodySnapshot;
}

function fmt(v: number) {
  return v.toFixed(3);
}

// Custom dot: renders a red circle on collision frames, nothing otherwise.
function CollisionDot(props: { cx?: number; cy?: number; payload?: Frame }) {
  const { cx, cy, payload } = props;
  if (!payload?.colliding || cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#7f1d1d" strokeWidth={1} />;
}

export default function TrajectoryChart({ frames, body, wall }: Props) {
  const maxY = Math.max(...frames.map((f) => f.y));
  const peak = frames.find((f) => f.y === maxY)!;
  const firstCollision = frames.find((f) => f.colliding);
  const collisionCount = frames.filter((f) => f.colliding).length;

  // Wall AABB bounds for ReferenceArea
  const wallX1 = wall.x - wall.width / 2;
  const wallX2 = wall.x + wall.width / 2;

  // X domain must always include the right edge of the wall, regardless of
  // where the trajectory data ends — otherwise the wall gets clipped out.
  const dataXMin = Math.min(...frames.map((f) => f.x));
  const dataXMax = Math.max(...frames.map((f) => f.x));
  const xDomain: [number, number] = [
    Math.floor(dataXMin - 1),
    Math.ceil(Math.max(dataXMax, wallX2) + 2),
  ];

  // Body AABB bounds at peak and first collision
  const aabbAt = (f: Frame) => ({
    x1: f.x - body.width / 2,
    x2: f.x + body.width / 2,
    y1: f.y - body.height / 2,
    y2: f.y + body.height / 2,
  });

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={440}>
        <LineChart data={frames} margin={{ top: 16, right: 40, left: 16, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="x"
            type="number"
            domain={xDomain}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{ value: "X (m)", position: "insideBottomRight", offset: -8, fill: "#94a3b8" }}
            stroke="#475569"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            type="number"
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{ value: "Y (m)", angle: -90, position: "insideLeft", offset: 8, fill: "#94a3b8" }}
            stroke="#475569"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />

          <Tooltip
            contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8 }}
            labelStyle={{ color: "#94a3b8", fontSize: 11 }}
            itemStyle={{ color: "#38bdf8" }}
            formatter={(value, name) => [fmt(Number(value)), name === "y" ? "Y" : name]}
            labelFormatter={(label) => `X: ${fmt(Number(label))} m`}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const f = payload[0].payload as Frame;
              return (
                <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs">
                  <p className="text-slate-400">X: {fmt(f.x)} m</p>
                  <p className="text-sky-400">Y: {fmt(f.y)} m</p>
                  {f.colliding && (
                    <p className="text-red-400 font-semibold mt-1">⚠ Collisione</p>
                  )}
                </div>
              );
            }}
          />

          {/* Wall — orange shaded rectangle spanning the full chart height.
              y1/y2 are intentionally omitted: if the wall's physical bounds
              fall outside the data domain, Recharts would discard the area
              entirely. Without y1/y2 it fills the full visible Y range. */}
          <ReferenceArea
            x1={wallX1} x2={wallX2}
            fill="#f97316" fillOpacity={0.2}
            stroke="#f97316" strokeOpacity={0.8} strokeWidth={1.5}
            label={{ value: "Wall", position: "insideTop", fill: "#f97316", fontSize: 11 }}
          />

          {/* Body AABB at peak — sky blue ghost */}
          <ReferenceArea
            {...aabbAt(peak)}
            fill="#38bdf8" fillOpacity={0.12}
            stroke="#38bdf8" strokeOpacity={0.5} strokeDasharray="3 3"
          />

          {/* Body AABB at first collision — red ghost */}
          {firstCollision && (
            <ReferenceArea
              {...aabbAt(firstCollision)}
              fill="#ef4444" fillOpacity={0.15}
              stroke="#ef4444" strokeOpacity={0.6} strokeDasharray="3 3"
            />
          )}

          {/* Apex reference line */}
          <ReferenceLine
            x={peak.x}
            stroke="#f59e0b" strokeDasharray="4 4"
            label={{ value: `Apice Y=${fmt(peak.y)} m`, fill: "#f59e0b", fontSize: 11 }}
          />

          {/* Trajectory line */}
          <Line
            type="monotone"
            dataKey="y"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={<CollisionDot />}
            activeDot={{ r: 4, fill: "#38bdf8" }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <StatCard label="Gittata X" value={`${fmt(frames[frames.length - 1]?.x ?? 0)} m`} />
        <StatCard label="Altezza max" value={`${fmt(maxY)} m`} />
        <StatCard label="Body AABB" value={`${body.width} × ${body.height} m`} />
        <StatCard
          label="Collisioni"
          value={String(collisionCount)}
          highlight={collisionCount > 0}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs text-slate-400">
        <LegendItem color="#38bdf8" label="Traiettoria" />
        <LegendItem color="#f59e0b" label="Apice" dashed />
        <LegendItem color="#f97316" label={`Wall  (x=${wall.x}, ${wall.width}×${wall.height} m)`} box />
        <LegendItem color="#ef4444" label="Collisione" dot />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-3">
      <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-semibold mt-1 ${highlight ? "text-red-400" : "text-sky-400"}`}>
        {value}
      </p>
    </div>
  );
}

function LegendItem({
  color,
  label,
  dashed,
  box,
  dot,
}: {
  color: string;
  label: string;
  dashed?: boolean;
  box?: boolean;
  dot?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {dot ? (
        <svg width="10" height="10">
          <circle cx="5" cy="5" r="4" fill={color} />
        </svg>
      ) : box ? (
        <svg width="14" height="10">
          <rect x="0" y="1" width="14" height="8" fill={color} fillOpacity={0.3} stroke={color} strokeWidth={1} />
        </svg>
      ) : (
        <svg width="20" height="4">
          <line
            x1="0" y1="2" x2="20" y2="2"
            stroke={color} strokeWidth="2"
            strokeDasharray={dashed ? "4 3" : undefined}
          />
        </svg>
      )}
      {label}
    </span>
  );
}
