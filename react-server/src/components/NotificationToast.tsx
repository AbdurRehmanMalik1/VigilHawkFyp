export type NotifItem = {
  id: string;
  camera_id?: string;
  camera_name?: string;
  timestamp: string;
  detections?: any[];
  raw?: any;
};

type Props = {
  items: NotifItem[];
  onDismiss: (id: string) => void;
};

export default function NotificationToast({ items, onDismiss }: Props) {
  if (!items || items.length === 0) return null;

  const latest = items[0];

  return (
    <div
      aria-live="polite"
      className="fixed top-16 left-0 right-0 pointer-events-none z-[9999] flex justify-center px-4"
    >
      <div className="pointer-events-auto w-full max-w-xl mx-auto">
        <div
          key={latest.id}
          className={`mb-4 transform transition duration-300 ease-out
                      bg-gradient-to-r from-[#071024] via-[#09203a] to-black
                      text-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3
                      border border-white/6 backdrop-blur-md pointer-events-auto`}
          style={{ animation: `slideDown 320ms ease` }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-bold">{latest.camera_name ?? latest.camera_id ?? "Camera"}</div>
              <div className="text-xs text-white/70">{new Date(latest.timestamp).toLocaleString()}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs px-2 py-1 rounded bg-white/10 text-white/90">
                {latest.detections ? `${latest.detections.length} detections` : "Event"}
              </div>

              <button
                onClick={() => onDismiss(latest.id)}
                aria-label="Dismiss notification"
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="text-sm text-white/90">
            {latest.detections && latest.detections.length > 0 ? (
              <ul className="list-inside list-disc space-y-1">
                {latest.detections.map((d, idx) => (
                  <li key={idx} className="text-sm text-white/85">
                    <span className="font-medium">{d.class_name ?? d.label ?? "object"}</span>
                    {d.confidence ? <span className="text-white/60"> — {(d.confidence * 100).toFixed(0)}%</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-white/60">No extra details</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-10px) scale(.995); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}