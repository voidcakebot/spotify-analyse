"use client";
import { useMemo, useState } from "react";
import data from "../public/data/analysis.json";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("de-DE") : n);

function Card({ children }) { return <div className="card">{children}</div>; }
function Kpi({ label, value }) { return <Card><div className="kpi-label">{label}</div><div className="kpi-value">{value}</div></Card>; }

function Bars({ title, items }) {
  const max = Math.max(1, ...items.map((x) => x.hours || x.value || 0));
  return (
    <Card>
      <h3>{title}</h3>
      <div className="bars">
        {items.map((x, i) => {
          const v = x.hours ?? x.value ?? 0;
          const w = (v / max) * 100;
          return (
            <button key={`${x.name}-${i}`} className="barrow" title={x.name}>
              <span className="label">{x.name}</span>
              <span className="meter"><span style={{ width: `${w}%` }} /></span>
              <span className="num">{fmt(v)}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function Home() {
  const [tab, setTab] = useState("music");
  const [q, setQ] = useState("");

  const current = tab === "music" ? data.music : data.podcasts;
  const first = tab === "music" ? current.topArtists : current.topShows;
  const second = tab === "music" ? current.topTracks : current.topEpisodes;

  const listA = useMemo(() => first.filter((x) => (x.name || "").toLowerCase().includes(q.toLowerCase())).slice(0, 20), [first, q]);
  const listB = useMemo(() => second.filter((x) => (x.name || "").toLowerCase().includes(q.toLowerCase())).slice(0, 20), [second, q]);

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Spotify Analyse Dashboard</h1>
          <p>{data.meta.filesCount} Dateien · Musik/Podcasts getrennt · <a href={data.meta.contextLink} target="_blank" rel="noreferrer">Spotify Datenhilfe</a></p>
        </div>
        <div className="tabs">
          <button className={tab === "music" ? "active" : ""} onClick={() => setTab("music")}>Musik</button>
          <button className={tab === "podcasts" ? "active" : ""} onClick={() => setTab("podcasts")}>Podcasts</button>
        </div>
      </header>

      <div className="stickySearch">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "music" ? "Suche Artist/Track…" : "Suche Show/Episode…"} />
      </div>

      <section className="kpis">
        <Kpi label="Gesamt Events" value={fmt(data.overview.events)} />
        <Kpi label="Gesamt Stunden" value={fmt(data.overview.hours)} />
        <Kpi label={tab === "music" ? "Musik Events" : "Podcast Events"} value={fmt(current.kpis.events)} />
        <Kpi label={tab === "music" ? "Musik Stunden" : "Podcast Stunden"} value={fmt(current.kpis.hours)} />
        {tab === "music" && <Kpi label="Skip %" value={current.kpis.skipRate} />}
        {tab === "music" && <Kpi label="Shuffle %" value={current.kpis.shuffleRate} />}
      </section>

      <section className="grid2">
        <Bars title={tab === "music" ? "Top Artists" : "Top Shows"} items={listA} />
        <Bars title={tab === "music" ? "Top Tracks" : "Top Episodes"} items={listB} />
      </section>

      <style jsx>{`
        .page{min-height:100vh;background:linear-gradient(180deg,#070b14,#0a1020);color:#e9efff;padding:22px;max-width:1400px;margin:0 auto}
        .top{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap}
        h1{margin:0 0 6px;font-size:30px} p{color:#9fb1d9;margin:0} a{color:#7db3ff}
        .tabs{display:flex;gap:8px}
        .tabs button{background:#15213a;border:1px solid #2a3a5e;color:#cdd8f2;padding:10px 16px;border-radius:10px;cursor:pointer}
        .tabs .active{background:#284073;color:#fff}
        .stickySearch{position:sticky;top:0;z-index:4;background:rgba(8,12,22,.88);backdrop-filter:blur(6px);padding:10px 0;margin:8px 0}
        input{width:100%;padding:13px 14px;border-radius:12px;border:1px solid #2b3d66;background:#0f172a;color:#e9efff;font-size:15px}
        .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:10px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .card{background:linear-gradient(180deg,#10192d,#0f1729);border:1px solid #283756;border-radius:14px;padding:14px}
        .kpi-label{color:#95abd9;font-size:12px}.kpi-value{font-size:27px;font-weight:700;margin-top:6px}
        h3{margin:0 0 10px}
        .bars{display:flex;flex-direction:column;gap:8px}
        .barrow{display:grid;grid-template-columns:1.4fr 2fr auto;gap:10px;align-items:center;background:#0e1628;border:1px solid #243656;border-radius:10px;padding:8px 10px;text-align:left;color:#e9efff}
        .label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .meter{height:10px;background:#1b2a45;border-radius:999px;overflow:hidden}
        .meter span{display:block;height:100%;background:linear-gradient(90deg,#7c9cff,#2dd4bf)}
        .num{font-variant-numeric:tabular-nums;color:#a9bee7}
        @media(max-width:1000px){.grid2{grid-template-columns:1fr}.barrow{grid-template-columns:1fr 1.3fr auto}}
      `}</style>
    </main>
  );
}
