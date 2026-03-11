"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("de-DE") : n);

function Card({ children, className = "" }) { return <div className={`card ${className}`}>{children}</div>; }

function Kpi({ label, value }) {
  return <Card><div className="kpi-label">{label}</div><div className="kpi-value">{value}</div></Card>;
}

function BarBlock({ title, data, onClick }) {
  return (
    <Card>
      <h3>{title}</h3>
      <div className="chart">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243252" />
            <XAxis type="number" stroke="#9fb1d9" />
            <YAxis type="category" dataKey="name" width={180} stroke="#9fb1d9" />
            <Tooltip />
            <Bar dataKey="hours" fill="#7c9cff" radius={[0, 8, 8, 0]} onClick={onClick} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function Home() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("music");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetch("/data/analysis.json").then((r) => r.json()).then(setData); }, []);
  if (!data) return <main className="page">Lade Spotify Analyse…</main>;

  const current = tab === "music" ? data.music : data.podcasts;
  const listAKey = tab === "music" ? "topArtists" : "topShows";
  const listBKey = tab === "music" ? "topTracks" : "topEpisodes";

  const listA = useMemo(() => current[listAKey].filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20), [current, listAKey, q]);
  const listB = useMemo(() => current[listBKey].filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20), [current, listBKey, q]);

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Spotify Analyse Dashboard</h1>
          <p>{data.meta.filesCount} Dateien · Musik und Podcasts getrennt · <a href={data.meta.contextLink} target="_blank">Spotify Datenhilfe</a></p>
        </div>
        <div className="tabs">
          <button className={tab === "music" ? "active" : ""} onClick={() => { setTab("music"); setSelected(null); }}>Musik</button>
          <button className={tab === "podcasts" ? "active" : ""} onClick={() => { setTab("podcasts"); setSelected(null); }}>Podcasts</button>
        </div>
      </header>

      <section className="sticky">
        <input placeholder={tab === "music" ? "Suche Artist oder Track…" : "Suche Show oder Episode…"} value={q} onChange={(e) => setQ(e.target.value)} />
      </section>

      <section className="kpis">
        <Kpi label="Gesamt Events" value={fmt(data.overview.events)} />
        <Kpi label="Gesamt Stunden" value={fmt(data.overview.hours)} />
        <Kpi label={tab === "music" ? "Musik Events" : "Podcast Events"} value={fmt(current.kpis.events)} />
        <Kpi label={tab === "music" ? "Musik Stunden" : "Podcast Stunden"} value={fmt(current.kpis.hours)} />
        {tab === "music" && <Kpi label="Skip %" value={current.kpis.skipRate} />}
        {tab === "music" && <Kpi label="Shuffle %" value={current.kpis.shuffleRate} />}
      </section>

      <section className="grid2">
        <Card>
          <h3>Monatsverlauf</h3>
          <div className="chart"><ResponsiveContainer width="100%" height={300}><LineChart data={current.time.month}><CartesianGrid strokeDasharray="3 3" stroke="#243252" /><XAxis dataKey="name" stroke="#9fb1d9" /><YAxis stroke="#9fb1d9" /><Tooltip /><Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>
        </Card>
        <Card>
          <h3>Jahresvergleich</h3>
          <div className="chart"><ResponsiveContainer width="100%" height={300}><BarChart data={current.time.year}><CartesianGrid strokeDasharray="3 3" stroke="#243252" /><XAxis dataKey="name" stroke="#9fb1d9" /><YAxis stroke="#9fb1d9" /><Tooltip /><Bar dataKey="value" fill="#f59e0b" radius={[8,8,0,0]} /></BarChart></ResponsiveContainer></div>
        </Card>
      </section>

      <section className="grid2">
        <BarBlock title={tab === "music" ? "Top Artists (klickbar)" : "Top Shows (klickbar)"} data={listA} onClick={(d) => setSelected(d?.name)} />
        <BarBlock title={tab === "music" ? "Top Tracks (klickbar)" : "Top Episodes (klickbar)"} data={listB} onClick={(d) => setSelected(d?.name)} />
      </section>

      <Card>
        <h3>Ausgewähltes Element</h3>
        <p>{selected ? `Du hast ausgewählt: ${selected}` : "Klicke auf einen Balken in den Top-Listen."}</p>
      </Card>

      <style jsx>{`
        .page{min-height:100vh;background:linear-gradient(180deg,#070b14,#0a1020);color:#e9efff;padding:22px;max-width:1400px;margin:0 auto}
        .top{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap}
        h1{margin:0 0 6px;font-size:30px} p{color:#9fb1d9;margin:0}
        a{color:#7db3ff}
        .tabs{display:flex;gap:8px}
        .tabs button{background:#15213a;border:1px solid #2a3a5e;color:#cdd8f2;padding:10px 16px;border-radius:10px;cursor:pointer}
        .tabs .active{background:#284073;color:#fff}
        .sticky{position:sticky;top:0;z-index:4;background:rgba(8,12,22,.85);backdrop-filter:blur(6px);padding:10px 0;margin:8px 0}
        input{width:100%;padding:13px 14px;border-radius:12px;border:1px solid #2b3d66;background:#0f172a;color:#e9efff;font-size:15px}
        .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:10px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .card{background:linear-gradient(180deg,#10192d,#0f1729);border:1px solid #283756;border-radius:14px;padding:14px}
        .kpi-label{color:#95abd9;font-size:12px}.kpi-value{font-size:27px;font-weight:700;margin-top:6px}
        .chart{margin-top:6px}
        h3{margin:0 0 8px}
        @media(max-width:1000px){.grid2{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
