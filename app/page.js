"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#60a5fa", "#34d399", "#f59e0b", "#f472b6", "#a78bfa", "#22d3ee", "#fb7185", "#4ade80"];

function Kpi({ label, value }) {
  return (
    <div className="card kpi">
      <div className="muted">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/analysis.json").then((r) => r.json()).then(setData);
  }, []);

  if (!data) return <main className="container">Lade Dashboard…</main>;

  const { kpis } = data;

  return (
    <main className="container">
      <h1>Spotify Analyse Dashboard</h1>
      <p className="muted">
        Datensätze: {data.filesCount} · Kontext: <a href={data.contextLink} target="_blank">Spotify Data Guide</a>
      </p>

      <section className="grid kpis">
        <Kpi label="Events" value={kpis.events.toLocaleString("de-DE")} />
        <Kpi label="Hörzeit (h)" value={kpis.hours} />
        <Kpi label="Tracks" value={kpis.tracks.toLocaleString("de-DE")} />
        <Kpi label="Podcasts" value={kpis.podcasts.toLocaleString("de-DE")} />
        <Kpi label="Skip %" value={kpis.skipRate} />
        <Kpi label="Shuffle %" value={kpis.shuffleRate} />
        <Kpi label="Offline %" value={kpis.offlineRate} />
      </section>

      <section className="grid two">
        <div className="card chart"><h3>Hörzeit pro Jahr</h3><ResponsiveContainer width="100%" height={300}><BarChart data={data.yearHours}><CartesianGrid strokeDasharray="3 3" stroke="#1f2b46"/><XAxis dataKey="name" stroke="#9fb1d9"/><YAxis stroke="#9fb1d9"/><Tooltip/><Bar dataKey="hours" fill="#60a5fa" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer></div>
        <div className="card chart"><h3>Hörzeit pro Monat</h3><ResponsiveContainer width="100%" height={300}><LineChart data={data.monthHours}><CartesianGrid strokeDasharray="3 3" stroke="#1f2b46"/><XAxis dataKey="name" stroke="#9fb1d9"/><YAxis stroke="#9fb1d9"/><Tooltip/><Line type="monotone" dataKey="hours" stroke="#34d399" strokeWidth={3} dot={false}/></LineChart></ResponsiveContainer></div>
      </section>

      <section className="grid two">
        <div className="card chart"><h3>Top Artists (Stunden)</h3><ResponsiveContainer width="100%" height={320}><BarChart data={data.topArtists}><CartesianGrid strokeDasharray="3 3" stroke="#1f2b46"/><XAxis dataKey="name" stroke="#9fb1d9" hide /><YAxis stroke="#9fb1d9"/><Tooltip/><Bar dataKey="hours" fill="#a78bfa"/></BarChart></ResponsiveContainer></div>
        <div className="card chart"><h3>Top Tracks (Stunden)</h3><ResponsiveContainer width="100%" height={320}><BarChart data={data.topTracks}><CartesianGrid strokeDasharray="3 3" stroke="#1f2b46"/><XAxis dataKey="name" stroke="#9fb1d9" hide /><YAxis stroke="#9fb1d9"/><Tooltip/><Bar dataKey="hours" fill="#f472b6"/></BarChart></ResponsiveContainer></div>
      </section>

      <section className="grid two">
        <div className="card chart"><h3>Länder</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data.countries} dataKey="events" nameKey="name" outerRadius={110}>{data.countries.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
        <div className="card chart"><h3>Plattformen</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data.platforms} dataKey="events" nameKey="name" outerRadius={110}>{data.platforms.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
      </section>

      <style jsx>{`
        .container {max-width: 1320px; margin: 0 auto; padding: 24px; background: #070b14; color: #e8efff; min-height: 100vh;}
        h1 {margin: 0 0 8px; font-size: 32px}
        .muted {color: #9fb1d9}
        a {color: #7db3ff}
        .grid {display: grid; gap: 12px; margin-top: 12px}
        .kpis {grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));}
        .two {grid-template-columns: 1fr 1fr;}
        .card {background: #111a2d; border: 1px solid #243553; border-radius: 14px; padding: 14px;}
        .kpi .value {font-size: 26px; font-weight: 700; margin-top: 6px}
        .chart h3 {margin: 0 0 8px}
        @media (max-width: 980px) {.two {grid-template-columns: 1fr;}}
      `}</style>
    </main>
  );
}
