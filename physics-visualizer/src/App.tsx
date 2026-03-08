import { useState, useCallback } from "react";
import TrajectoryChart from "./TrajectoryChart";

type Point = { x: number; y: number };

type LoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; data: Point[] }
  | { status: "error"; message: string };

async function fetchTrajectory(): Promise<Point[]> {
  const res = await fetch("/trajectory.json", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error("Formato JSON non valido: atteso un array.");
  return json as Point[];
}

export default function App() {
  const [state, setState] = useState<LoadState>({ status: "idle" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const data = await fetchTrajectory();
      setState({ status: "ok", data });
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Physics Visualizer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Traiettoria dal motore fisico Rust &mdash; gravità + drag
            </p>
          </div>

          <button
            onClick={load}
            disabled={state.status === "loading"}
            className="flex items-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {state.status === "loading" ? (
              <>
                <Spinner />
                Caricamento…
              </>
            ) : (
              <>
                <ReloadIcon />
                {state.status === "idle" ? "Carica dati" : "Ricarica dati"}
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-6 shadow-lg">
          {state.status === "idle" && (
            <EmptyState onLoad={load} />
          )}

          {state.status === "loading" && (
            <div className="flex justify-center items-center h-64 text-slate-400">
              <Spinner className="w-6 h-6 mr-2" /> Caricamento trajectory.json…
            </div>
          )}

          {state.status === "error" && (
            <div className="rounded-lg bg-red-950 border border-red-800 p-4 text-red-300 text-sm">
              <span className="font-semibold">Errore:</span> {state.message}
              <p className="text-red-400 mt-2 text-xs">
                Assicurati di aver eseguito{" "}
                <code className="bg-red-900 px-1 rounded">cargo run &gt; trajectory.json</code>{" "}
                e che il file sia nella root del progetto Rust.
              </p>
            </div>
          )}

          {state.status === "ok" && <TrajectoryChart data={state.data} />}
        </div>

        {state.status === "ok" && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Aggiorna il JSON rieseguendo{" "}
            <code className="text-slate-400">cargo run &gt; trajectory.json</code>, poi premi{" "}
            <strong>Ricarica dati</strong>.
          </p>
        )}
      </div>
    </div>
  );
}

function EmptyState({ onLoad }: { onLoad: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
      <div className="text-5xl">🚀</div>
      <p className="text-sm">Nessun dato caricato.</p>
      <button
        onClick={onLoad}
        className="text-sky-400 hover:text-sky-300 text-sm underline underline-offset-2"
      >
        Carica trajectory.json
      </button>
    </div>
  );
}

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
      />
    </svg>
  );
}

function ReloadIcon() {
  return (
    <svg
      className="w-4 h-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4v5h.582M20 20v-5h-.581M5.404 9A8.001 8.001 0 0119.938 13M18.596 15A8.001 8.001 0 015.062 11"
      />
    </svg>
  );
}
