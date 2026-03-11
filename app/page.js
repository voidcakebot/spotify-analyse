"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fmt = (n) => (typeof n === "number" ? n.toLocaleString("de-DE") : n);

function Card({ children }) {
  return <div className="card">{children}</div>;
}

function Kpi({ label, value }) {
  return (
    <Card>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </Card>
  );
}

const baseOpts = {
  chart: { toolbar: { show: false }, foreColor: "#b8c7e8" },
  dataLabels: { enabled: false },
  grid: { borderColor: "#243252" },
  theme: { mode: "dark" },
  tooltip: { theme: "dark" },
};

export default function Home() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("music");
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/data/analysis.json").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <main className="page">Lade Spotify Analyse…</main>;

  const current = tab === "music" ? data.music : data.podcasts;
  const firstList = tab === "music" ? current.topArtists : current.topShows;
  const secondList = tab === "music" ? current.topTracks : current.topEpisodes;

  const filteredA = useMemo(
    () => firstList.filter((x) => (x?.name || "").toLowerCase().includes(q.toLowerCase())).slice(0, 20),
    [firstList, q]
  );
  const filteredB = useMemo(
    () => secondList.filter((x) => (x?.name || "").toLowerCase().includes(q.toLowerCase())).slice(0, 20),
    [secondList, q]
  );

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Spotify Analyse Dashboard</h1>
          <p>{data.meta.filesCount} Dateien · getrennt nach Musik und Podcasts · <a href={data.meta.contextLink} target="_blank" rel="noreferrer">Spotify Datenhilfe</a></p>
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
        <Card>
          <h3>Monatsverlauf (Stunden)</h3>
          <Chart
            type="line"
            height={320}
            series={[{ name: "Stunden", data: current.time.month.map((x) => x.value) }]}
            options={{ ...baseOpts, xaxis: { categories: current.time.month.map((x) => x.name) }, stroke: { curve: "smooth", width: 3 }, colors: ["#2dd4bf"] }}
          />
        </Card>
        <Card>
          <h3>Jahresvergleich (Stunden)</h3>
          <Chart
            type="bar"
            height={320}
            series={[{ name: "Stunden", data: current.time.year.map((x) => x.value) }]}
            options={{ ...baseOpts, xaxis: { categories: current.time.year.map((x) => x.name) }, colors: ["#f59e0b"], plotOptions: { bar: { borderRadius: 6 } } }}
          />
        </Card>
      </section>

      <section className="grid2">
        <Card>
          <h3>{tab === "music" ? "Top Artists" : "Top Shows"}</h3>
          <Chart
            type="bar"
            height={380}
            series={[{ name: "Stunden", data: filteredA.map((x) => x.hours) }]}
            options={{ ...baseOpts, xaxis: { categories: filteredA.map((x) => x.name) }, colors: ["#7c9cff"], plotOptions: { bar: { borderRadius: 6, horizontal: true } } }}
          />
        </Card>
        <Card>
          <h3>{tab === "music" ? "Top Tracks" : "Top Episodes"}</h3>
          <Chart
            type="bar"
            height={380}
            series={[{ name: "Stunden", data: filteredB.map((x) => x.hours) }]}
            options={{ ...baseOpts, xaxis: { categories: filteredB.map((x) => x.name) }, colors: ["#f472b6"], plotOptions: { bar: { borderRadius: 6, horizontal: true } } }}
          />
        </Card>
      </section>

      <style jsx>{`
        .page{min-height:100vh;background:linear-gradient(180deg,#070b14,#0a1020);color:#e9efff;padding:22px;max-width:1400px;margin:0 auto}
        .top{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap}
        h1{margin:0 0 6px;font-size:30px} p{color:#9fb1d9;margin:0}
        a{color:#7db3ff}
        .tabs{display:flex;gap:8px}
        .tabs button{background:#15213a;border:1px solid #2a3a5e;color:#cdd8f2;padding:10px 16px;border-radius:10px;cursor:pointer}
        .tabs .active{background:#284073;color:#fff}
        .stickySearch{position:sticky;top:0;z-index:4;background:rgba(8,12,22,.88);backdrop-filter:blur(6px);padding:10px 0;margin:8px 0}
        input{width:100%;padding:13px 14px;border-radius:12px;border:1px solid #2b3d66;background:#0f172a;color:#e9efff;font-size:15px}
        .kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:10px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .card{background:linear-gradient(180deg,#10192d,#0f1729);border:1px solid #283756;border-radius:14px;padding:14px}
        .kpi-label{color:#95abd9;font-size:12px}.kpi-value{font-size:27px;font-weight:700;margin-top:6px}
        h3{margin:0 0 8px}
        @media(max-width:1000px){.grid2{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
