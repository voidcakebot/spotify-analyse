"use client";
import { useMemo, useState } from "react";
import data from "../public/data/analysis.json";

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("de-DE") : n);

function Card({ children, className = "" }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Kpi({ label, value }) {
  return (
    <Card className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </Card>
  );
}

function FancyBars({ title, items }) {
  const max = Math.max(1, ...items.map((x) => x.hours || x.value || 0));
  return (
    <Card>
      <h3>{title}</h3>
      <div className="rows">
        {items.map((x, i) => {
          const v = x.hours ?? x.value ?? 0;
          const pct = (v / max) * 100;
          return (
            <button key={`${x.name}-${i}`} className="row" title={x.name}>
              <span className="name">{x.name}</span>
              <span className="track">
                <span className="fill" style={{ width: `${pct}%` }} />
              </span>
              <span className="val">{fmt(v)}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export default function Home() {
  const [tab, setTab] = useState("music");
  const [query, setQuery] = useState("");

  const current = tab === "music" ? data.music : data.podcasts;
  const primary = tab === "music" ? current.topArtists : current.topShows;
  const secondary = tab === "music" ? current.topTracks : current.topEpisodes;

  const filteredA = useMemo(
    () => primary.filter((x) => x.name.toLowerCase().includes(query.toLowerCase())).slice(0, 20),
    [primary, query]
  );
  const filteredB = useMemo(
    () => secondary.filter((x) => x.name.toLowerCase().includes(query.toLowerCase())).slice(0, 20),
    [secondary, query]
  );

  return (
    <main className="page">
      <div className="glow glow1" />
      <div className="glow glow2" />

      <header className="hero">
        <div>
          <p className="eyebrow">Spotify Analyse</p>
          <h1>Luxury Dark Dashboard</h1>
          <p className="sub">
            {data.meta.filesCount} Dateien · klare Trennung nach Musik & Podcasts ·{" "}
            <a href={data.meta.contextLink} target="_blank" rel="noreferrer">Datenreferenz</a>
          </p>
        </div>
        <div className="tabs">
          <button className={tab === "music" ? "active" : ""} onClick={() => setTab("music")}>Musik</button>
          <button className={tab === "podcasts" ? "active" : ""} onClick={() => setTab("podcasts")}>Podcasts</button>
        </div>
      </header>

      <div className="searchWrap">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tab === "music" ? "Suche Artist oder Track…" : "Suche Show oder Episode…"}
        />
      </div>

      <section className="kpis">
        <Kpi label="Gesamt Events" value={fmt(data.overview.events)} />
        <Kpi label="Gesamt Stunden" value={fmt(data.overview.hours)} />
        <Kpi label={tab === "music" ? "Musik Events" : "Podcast Events"} value={fmt(current.kpis.events)} />
        <Kpi label={tab === "music" ? "Musik Stunden" : "Podcast Stunden"} value={fmt(current.kpis.hours)} />
        {tab === "music" && <Kpi label="Skip %" value={current.kpis.skipRate} />}
        {tab === "music" && <Kpi label="Shuffle %" value={current.kpis.shuffleRate} />}
      </section>

      <section className="grid">
        <FancyBars title={tab === "music" ? "Top Artists" : "Top Shows"} items={filteredA} />
        <FancyBars title={tab === "music" ? "Top Tracks" : "Top Episodes"} items={filteredB} />
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: radial-gradient(1200px 500px at 20% -10%, #2b1a4f 0%, #090c16 45%, #070a13 100%);
          color: #f7f3ea;
          padding: 24px;
          max-width: 1440px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          font-family: "Georgia", "Times New Roman", serif;
        }
        .glow { position: absolute; border-radius: 999px; filter: blur(70px); pointer-events: none; }
        .glow1 { width: 260px; height: 260px; background: rgba(187, 133, 66, 0.25); top: -70px; right: -40px; }
        .glow2 { width: 300px; height: 300px; background: rgba(107, 76, 174, 0.22); bottom: -120px; left: -80px; }

        .hero { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; position: relative; z-index: 1; }
        .eyebrow { letter-spacing: 0.18em; text-transform: uppercase; color: #b48a4f; font-size: 11px; margin-bottom: 10px; font-family: Arial, sans-serif; }
        h1 { margin: 0; font-size: 44px; line-height: 1; font-weight: 600; }
        .sub { color: #c8c2b8; margin-top: 10px; font-family: Arial, sans-serif; }
        a { color: #e5b56c; }

        .tabs { display: flex; gap: 10px; }
        .tabs button {
          border: 1px solid #3e2f1d;
          color: #e4dccf;
          background: linear-gradient(180deg, #1a1520, #12101a);
          padding: 10px 16px;
          border-radius: 999px;
          cursor: pointer;
          font-family: Arial, sans-serif;
        }
        .tabs .active {
          background: linear-gradient(180deg, #3f2b16, #291d11);
          border-color: #8e6736;
          box-shadow: 0 0 0 1px rgba(204, 149, 78, 0.35);
        }

        .searchWrap { position: sticky; top: 0; z-index: 4; padding: 10px 0; backdrop-filter: blur(5px); }
        input {
          width: 100%; padding: 13px 16px; border-radius: 14px;
          border: 1px solid #3f3122; background: rgba(21, 17, 14, 0.82); color: #f4ecde;
          font-family: Arial, sans-serif; font-size: 15px;
        }

        .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; margin: 10px 0 14px; }
        .card {
          background: linear-gradient(180deg, rgba(24, 19, 16, 0.84), rgba(13, 12, 16, 0.92));
          border: 1px solid #34281f; border-radius: 16px; padding: 14px;
          box-shadow: inset 0 1px 0 rgba(255, 231, 200, 0.05), 0 10px 30px rgba(0,0,0,0.24);
          position: relative; z-index: 1;
        }
        .kpi-label { color: #c9b8a0; font-size: 12px; font-family: Arial, sans-serif; }
        .kpi-value { font-size: 28px; margin-top: 6px; color: #f8e7c9; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        h3 { margin: 0 0 10px; font-size: 22px; color: #f1dfc1; }

        .rows { display: flex; flex-direction: column; gap: 8px; }
        .row {
          display: grid; grid-template-columns: 1.4fr 2fr auto; gap: 10px; align-items: center;
          background: rgba(14, 12, 13, 0.7); border: 1px solid #34281f; border-radius: 12px;
          padding: 8px 10px; color: #f1eadb; text-align: left; cursor: pointer;
        }
        .row:hover { border-color: #8a6539; transform: translateY(-1px); }
        .name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: Arial, sans-serif; }
        .track { height: 9px; background: #1b1717; border-radius: 999px; overflow: hidden; }
        .fill { display: block; height: 100%; background: linear-gradient(90deg, #a86f2d, #f0c27f, #8b63d0); }
        .val { color: #e7c792; font-variant-numeric: tabular-nums; font-family: Arial, sans-serif; }

        @media (max-width: 1000px) {
          .grid { grid-template-columns: 1fr; }
          h1 { font-size: 34px; }
          .row { grid-template-columns: 1fr 1.4fr auto; }
        }
      `}</style>
    </main>
  );
}
