import LogsTable from "../components/LogsTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAlertsAPI, fetchAlertsAPI, type AlertItem, type FetchAlertsParams } from "../feature/api/log";
import { useEffect, useState } from "react";
import CameraImage from '../assets/Camera Image.png';
import { useNavigate } from "react-router";

const priorityColors: Record<AlertItem["priority"], string> = {
  High: "text-red-500",
  Medium: "text-orange-500",
  Low: "text-green-500",
};

export default function AlertsAndLogs() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [params, setParams] = useState<FetchAlertsParams>({ limit: 10, skip: 0, searchString: "" });

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(prev => ({ ...prev, searchString: searchInput }));
    }, 2000);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["alerts", params],
    queryFn: () => fetchAlertsAPI(params),
  });

  const alerts: AlertItem[] = Array.isArray(data) ? data : [];
  const queryClient = useQueryClient();

  const clearAlertsMutation = useMutation({
    mutationFn: deleteAlertsAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (error) => {
      console.error("Failed to clear alerts:", error);
    },
  });

  const handleClearAll = () => {
    if (!alerts.length) return;
    clearAlertsMutation.mutate({ alert_ids: alerts.map((a) => a.id) });
  };

  const handleSearchString = (e: any) => {
    setSearchInput(e.target.value);
  };

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-black/90 dark:text-white/90">
            Alerts &amp; Logs
          </h1>
        </header>

        {/* Alerts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black/90 dark:text-white/90 mb-4">
            Alerts
          </h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <input
                onChange={handleSearchString}
                value={searchInput}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary text-black/90 dark:text-white/90 placeholder-black/50 dark:placeholder-white/50"
                placeholder="Search alerts..."
                type="text"
              />
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10">
                Threat Type
              </button>
              <button className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10">
                Date Range
              </button>
              <button className="px-4 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10">
                Priority Level
              </button>
            </div>
            <div className="flex gap-4">
              <button onClick={handleClearAll} disabled={clearAlertsMutation.isPending} className="px-4 py-2 rounded-lg bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/20 dark:hover:bg-white/20">
                Clear All Alerts
              </button>
              <button onClick={() => refetch()} disabled={clearAlertsMutation.isPending} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
                Refresh Alerts
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading && <p className="text-sm text-black/50 dark:text-white/50">Refreshing...</p>}
            {isError && <p className="text-sm text-red-500">Failed to load alerts.</p>}
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-black/5 dark:bg-white/5 p-4 rounded-lg flex flex-col md:flex-row gap-6 border-l-4`}
              >
                <div className="flex-1">
                  <h3 className={`font-bold ${priorityColors[alert.priority]}`}>
                    {alert.priority} Priority
                  </h3>
                  <div className="text-sm text-black/60 dark:text-white/60 mt-1 space-y-1">
                    <p>Camera: {alert.camera}</p>
                    <p>Location: {alert.location}</p>
                    <p>Time: {alert.time}</p>
                    <p>Confidence: {alert.confidence}%</p>
                  </div>
                  {/* Violations List */}
                  {alert.violation_reasons && alert.violation_reasons.length > 0 && (
                    <div className="mt-3">
                      <h4 className="font-semibold text-black/80 dark:text-white/80 text-sm mb-1">Violations:</h4>
                      <ul className="list-disc list-inside text-sm text-black/60 dark:text-white/60">
                        {alert.violation_reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    {/* <button className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 hover:bg-black/20 dark:hover:bg-white/20">
                      <span className="material-symbols-outlined text-base">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                          <circle cx={12} cy={12} r={10} stroke="#34D399" strokeWidth="1.6" fill="rgba(52,211,153,0.06)" />
                          <path d="M7.8 12.2l2.2 2.2 5.2-5.4" stroke="#34D399" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      </span>
                      Acknowledge
                    </button> */}
                    <button onClick={() => { console.log('clicked'); navigate(`/cameras/${alert.camera_id}`) }} className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 hover:bg-black/20 dark:hover:bg-white/20">
                      <span className="material-symbols-outlined text-base">
                        <svg width={22} height={20} viewBox="0 0 24 24" fill="none">
                          <rect x="2.5" y="6.5" width={13} height={11} rx={2} stroke="#93C5FD" strokeWidth="1.6" fill="rgba(147,197,253,0.04)" />
                          <path d="M16 9.5l5-3v11l-5-3" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          <circle cx="6.5" cy={12} r="0.9" fill="#93C5FD" />
                        </svg>
                      </span>
                      View Feed
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 hover:bg-black/20 dark:hover:bg-white/20">
                      <span className="material-symbols-outlined text-base">
                        <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                          <circle cx={12} cy={12} r={10} stroke="#FB7185" strokeWidth="1.4" fill="rgba(251,113,133,0.04)" />
                          <path d="M8 8l8 8M16 8l-8 8" stroke="#FB7185" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      Delete
                    </button>
                  </div>
                </div>

                <div
                  className="w-full md:w-64 h-40 bg-cover bg-center rounded-lg"
                  style={{ backgroundImage: `url("${alert?.imageUrl ?? CameraImage}")` }}
                ></div>
              </div>
            ))}
          </div>
        </section>

        {/* Logs Section */}
        <section>
          <h2 className="text-2xl font-bold text-black/90 dark:text-white/90 mb-4">
            Logs
          </h2>
          <div className="overflow-x-auto dark:bg-background-dark rounded-lg border border-black/10 dark:border-white/10">
            <LogsTable />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button className="px-4 py-2 rounded-lg bg-black/10 dark:bg-white/10 text-black/80 dark:text-white/80 text-sm font-medium hover:bg-black/20 dark:hover:bg-white/20">
              Export Logs
            </button>
            <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
              Auto-Purge Old Logs
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}