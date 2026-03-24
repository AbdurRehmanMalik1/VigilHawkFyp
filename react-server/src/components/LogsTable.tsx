import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyLogsAPI, type GetMyLogsParams, type LogEntry } from "../feature/api/log";
import React from "react";


function LogsTable() {
    const [params, setParams] = useState<GetMyLogsParams>({ limit: 20, skip: 0 });
    const { data, isLoading } = useQuery({
        queryKey: ["logs", params],
        queryFn: () => getMyLogsAPI(params),
    });

    const logs: LogEntry[] = Array.isArray(data?.data) ? data.data : [];
    const total = data?.total ?? 0;

    // --- Status color mapping ---
    const statusColors: Record<string, string> = {
        Successful: "bg-green-500/20 text-green-500",
        Active: "bg-green-500/20 text-green-500",
        Triggered: "bg-orange-500/20 text-orange-500",
        Completed: "bg-blue-500/20 text-blue-500",
        Failed: "bg-red-500/20 text-red-500",
    };

    // --- Pagination helpers ---
    const handleNext = () => {
        if (params.skip + params.limit < total) {
            setParams({ ...params, skip: params.skip + params.limit });
        }
    };

    const handlePrev = () => {
        if (params.skip - params.limit >= 0) {
            setParams({ ...params, skip: params.skip - params.limit });
        }
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setParams({ ...params, limit: parseInt(e.target.value) as any, skip: 0 });
    };

    return (
        <div className="overflow-x-auto p-4">
            {/* --- Pagination Controls --- */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <button
                        onClick={handlePrev}
                        disabled={params.skip === 0}
                        className="px-3 py-1 rounded bg-primary text-light hover:opacity-90 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={params.skip + params.limit >= total}
                        className="px-3 py-1 rounded bg-primary text-light hover:opacity-90 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div>
                    <label className="mr-2 font-medium text-gray-700 dark:text-gray-300">Items per page:</label>
                    <select
                        value={params.limit}
                        onChange={handleLimitChange}
                        className="px-2 py-1 border rounded bg-white dark:bg-gray-700 text-black dark:text-white"
                    >
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>
            </div>

            {/* --- Logs Table --- */}
            {isLoading ? (
                <p className="p-4 text-center text-gray-500 dark:text-gray-300">Loading logs...</p>
            ) : (
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                    <thead className="bg-black/5 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">Timestamp</th>
                            <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">Event Type</th>
                            <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">Source</th>
                            <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">Reference Id</th>
                            <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">Description</th>
                            <th className="px-6 py-3 font-medium text-black/80 dark:text-white/80">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 dark:divide-white/10">
                        {logs.map((log) => (
                            <tr key={log.timestamp + log.event_type}>
                                <td className="px-6 py-4 text-black/60 dark:text-white/60">{log.timestamp}</td>
                                <td className="px-6 py-4 text-black/60 dark:text-white/60">{log.event_type}</td>
                                <td className="px-6 py-4 text-black/60 dark:text-white/60">{log.source}</td>
                                <td className="px-6 py-4 text-black/60 dark:text-white/60">{String(log.reference_id ?? "")}</td>
                                <td className="px-6 py-4 text-black/60 dark:text-white/60">{log.description}</td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[log.status] ?? "bg-gray-200 text-gray-600"
                                            }`}
                                    >
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* --- Showing current range --- */}
            {!isLoading && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Showing {params.skip + 1} - {Math.min(params.skip + params.limit, total)} of {total} logs
                </p>
            )}
        </div>
    );
}


export default React.memo(LogsTable);