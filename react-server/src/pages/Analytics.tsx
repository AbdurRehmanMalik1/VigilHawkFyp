"use client";

import { useEffect, useState, useCallback } from "react";
import { getAnalyticsAPI } from "../feature/api/analytics";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [start, setStart] = useState<Date | undefined>();
  const [end, setEnd] = useState<Date | undefined>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAnalyticsAPI(start, end);
      setData(result);
    } catch {
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, [start, end]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const donutColors = ["#2563EB", "#60A5FA", "#93C5FD", "#FBBF24"];

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Analytics & Insights</h2>
        <div className="flex gap-2 items-center">
          <input type="date" onChange={(e) => setStart(e.target.value ? new Date(e.target.value) : undefined)} className="border rounded p-1" />
          <input type="date" onChange={(e) => setEnd(e.target.value ? new Date(e.target.value) : undefined)} className="border rounded p-1" />
          <button onClick={fetchData} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Loading..." : "Refresh"}</button>
        </div>
      </header>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Detections", value: loading ? "—" : data?.kpis.total_detections.toLocaleString() ?? "—" },
          { label: "Active Cameras", value: loading ? "—" : data?.kpis.active_cameras ?? "—" },
          { label: "Avg. Response Time", value: loading ? "—" : data?.kpis.avg_response_time ? `${data.kpis.avg_response_time}s` : "N/A" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-6 rounded-xl border border-border-light shadow-sm bg-background-dark/80"
          >
            <p className="text-sm font-medium text-gray-300">{label}</p>
            <p className="text-3xl font-bold text-light mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Threat Trends */}
      <div className="bg-background-dark/80 p-4 rounded-xl shadow border border-border-light">
        <h3 className="font-bold mb-2 text-light">Threat Trends</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data?.threat_trends || []}>
            <defs>
              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="_id" stroke="var(--text-gray)" />
            <YAxis stroke="var(--text-gray)" />
            <Tooltip
              contentStyle={{ backgroundColor: 'var(--background-dark)', border: '1px solid var(--border-light)', color: 'var(--text-light)' }}
              labelStyle={{ color: 'var(--text-gray)' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--primary)"
              fill="url(#colorTrend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Camera Activity & Threat Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Camera Activity */}
        <div className="bg-background-dark/80 p-4 rounded-xl shadow border border-border-light">
          <h3 className="font-bold mb-2 text-light">Camera Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={data?.camera_activity || []}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="camera_name" stroke="var(--text-gray)" />
              <YAxis stroke="var(--text-gray)" />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--background-dark)', border: '1px solid var(--border-light)', color: 'var(--text-light)' }}
                labelStyle={{ color: 'var(--text-gray)' }}
              />
              <Bar dataKey="count" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Distribution */}
        <div className="bg-background-dark/80 p-4 rounded-xl shadow border border-border-light">
          <h3 className="font-bold mb-2 text-light">Threat Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data?.threat_distribution || []}
                dataKey="count"
                nameKey="type"
                innerRadius={50}
                outerRadius={80}
                label
              >
                {data?.threat_distribution.map((_: any, i: number) => (
                  <Cell
                    key={i}
                    fill={donutColors[i % donutColors.length]}
                    stroke="var(--background-dark)"
                  />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{ color: 'var(--text-gray)' }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--background-dark)', border: '1px solid var(--border-light)', color: 'var(--text-light)' }}
                labelStyle={{ color: 'var(--text-gray)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU Usage */}
        <div className="bg-background-dark/80 p-4 rounded-xl shadow border border-border-light">
          <p className="text-gray-300">CPU Usage</p>
          <p className="text-2xl font-bold text-light">{data?.system.cpu != null ? `${data.system.cpu.toFixed(1)}%` : "—"}</p>
          {/* Optional progress bar */}
          {data?.system.cpu != null && (
            <div className="mt-2 h-2 rounded-full bg-background-light/20">
              <div
                className={`h-2 rounded-full ${data.system.cpu > 80 ? "bg-red-500" : data.system.cpu > 60 ? "bg-yellow-500" : "bg-primary"}`}
                style={{ width: `${data.system.cpu}%` }}
              />
            </div>
          )}
        </div>

        {/* Memory Usage */}
        <div className="bg-background-dark/80 p-4 rounded-xl shadow border border-border-light">
          <p className="text-gray-300">Memory Usage</p>
          <p className="text-2xl font-bold text-light">{data?.system.memory != null ? `${data.system.memory.toFixed(1)}%` : "—"}</p>
          {/* Optional progress bar */}
          {data?.system.memory != null && (
            <div className="mt-2 h-2 rounded-full bg-background-light/20">
              <div
                className={`h-2 rounded-full ${data.system.memory > 80 ? "bg-red-500" : data.system.memory > 60 ? "bg-yellow-500" : "bg-primary"}`}
                style={{ width: `${data.system.memory}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}