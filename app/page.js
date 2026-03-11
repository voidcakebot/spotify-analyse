"use client";
import { useMemo, useState } from "react";
import data from "../public/data/analysis.json";

const nf = new Intl.NumberFormat("de-DE");
const f = (v) => (typeof v === "number" ? nf.format(v) : v);

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="statLabel">{label}</div>
      <div className="statValue">{value}</div>
    </div>
  );
}

function Ranking({ title, items }) {
  const max = Math.max(1, ...items.map((i) => i.hours ?? i.value ?? 0));
  return (
    <section className="panel">
      <h3>{title}</h3>
      <ul className="rankList">
        {items.map((it, idx) => {
          const val = it.hours ?? it.value ?? 0;
          const pct = Math.max(4, Math.round((val / max) * 100));
          return (
            <li key={`${it.name}-${idx}`} className="row">
              <div className="rowHead">
                <span className="rank">#{idx + 1}</span>
                <span className="name">{it.name}</span>
                <span className="value">{f(val)}</span>
              </div>
              <div className="bar"><span style={{ width: `${pct}%` }} /></div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Home() {
  const [tab, setTab] = useState("music");
  const [q, setQ] = useState("");

  const cur = tab === "music" ? data.music : data.podcasts;
  const mainList = tab === "music" ? cur.topArtists : cur.topShows;
  const subList = tab === "music" ? cur.topTracks : cur.topEpisodes;

  const filteredMain = useMemo(
    () => mainList.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20),
    [mainList, q]
  );
  const filteredSub = useMemo(
    () => subList.filter((x) => x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 20),
    [subList, q]
  );

  return (
    <main className="page">
      <header className="header panel">
        <div>
          <p className="overline">Spotify Analyse</p>
          <h1>Dashboard</h1>
          <p className="meta">{data.meta.filesCount} Dateien · Musik und Podcasts getrennt · <a href={data.meta.contextLink} target="_blank" rel="noreferrer">Datenreferenz</a></p>
        </div>
        <div className="tabs" role="tablist" aria-label="Modus">
          <button className={tab === "music" ? "active" : ""} onClick={() => setTab("music")}>Musik</button>
          <button className={tab === "podcasts" ? "active" : ""} onClick={() => setTab("podcasts")}>Podcasts</button>
        </div>
      </header>

      <section className="panel sticky">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "music" ? "Suche Artist oder Track" : "Suche Show oder Episode"} />
      </section>

      <section className="stats">
        <Stat label="Gesamt Events" value={f(data.overview.events)} />
        <Stat label="Gesamt Stunden" value={f(data.overview.hours)} />
        <Stat label={tab === "music" ? "Musik Events" : "Podcast Events"} value={f(cur.kpis.events)} />
        <Stat label={tab === "music" ? "Musik Stunden" : "Podcast Stunden"} value={f(cur.kpis.hours)} />
        {tab === "music" && <Stat label="Skip %" value={cur.kpis.skipRate} />}
        {tab === "music" && <Stat label="Shuffle %" value={cur.kpis.shuffleRate} />}
      </section>

      <div className="grid">
        <Ranking title={tab === "music" ? "Top Artists" : "Top Shows"} items={filteredMain} />
        <Ranking title={tab === "music" ? "Top Tracks" : "Top Episodes"} items={filteredSub} />
      </div>

      <style jsx>{`
        .page { min-height: 100vh; background: #070b14; color: #eaf0ff; padding: 14px; max-width: 1200px; margin: 0 auto; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        .panel { background: #101827; border: 1px solid #1f2b40; border-radius: 14px; padding: 14px; }
        .header { display: grid; gap: 12px; }
        .overline { color: #93a6ce; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 4px; }
        h1 { margin: 0; font-size: 32px; line-height: 1.05; }
        .meta { color: #9eb0d5; margin: 6px 0 0; font-size: 14px; }
        .meta a { color: #89b4ff; }

        .tabs { display: flex; gap: 8px; }
        .tabs button { flex: 1; padding: 10px 12px; border-radius: 10px; border: 1px solid #304160; background: #121d30; color: #d7e4ff; font-weight: 600; }
        .tabs .active { background: #2a4f8f; border-color: #4f79bf; }

        .sticky { position: sticky; top: 0; z-index: 5; margin-top: 10px; backdrop-filter: blur(4px); }
        input { width: 100%; background: #0b1424; border: 1px solid #2a3d5f; color: #eaf0ff; border-radius: 10px; padding: 12px; font-size: 16px; }

        .stats { margin-top: 10px; display: grid; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .stat { background: #0f1a2b; border: 1px solid #21324f; border-radius: 12px; padding: 12px; }
        .statLabel { color: #9eb0d5; font-size: 12px; }
        .statValue { font-size: 24px; margin-top: 6px; font-weight: 800; }

        .grid { display: grid; gap: 12px; margin-top: 12px; }
        h3 { margin: 0 0 10px; font-size: 20px; }
        .rankList { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
        .row { background: #0d1626; border: 1px solid #1f314e; border-radius: 10px; padding: 8px; }
        .rowHead { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; margin-bottom: 6px; }
        .rank { color: #85a8ff; font-weight: 700; font-size: 12px; }
        .name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
        .value { color: #b9cdf8; font-weight: 700; font-size: 13px; }
        .bar { height: 8px; border-radius: 99px; background: #18263f; overflow: hidden; }
        .bar span { display: block; height: 100%; background: linear-gradient(90deg,#5ea1ff,#67e8f9); }

        @media (min-width: 860px) {
          .header { grid-template-columns: 1fr auto; align-items: end; }
          .tabs button { min-width: 140px; flex: initial; }
          .stats { grid-template-columns: repeat(6, minmax(0, 1fr)); }
          .grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </main>
  );
}
