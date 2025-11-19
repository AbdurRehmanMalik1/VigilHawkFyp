import { useNavigate } from "react-router";

export default function Cameras() {
  const navigate = useNavigate();

  // ==== Camera Data Array ====
  const cameras = [
    {
      id: 1,
      name: "Lobby Entrance",
      status: "REC",
      statusColor: "text-green-400",
      alert: true,
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo4x7dQAisVzRpXxGy82xtwgQq4oNv39orR1SNDZqQoXLHaVJMzGT3_4c8pbavJb6MN17eqkjwQWPmIK7S3-MkatdFTjTvPC-CKtmxby4XMsh6LpnDFmbaruXdoEIcuQcXaL1hiPNLti6CehG1pAO2O8bAMeGBtiXvuCPyw5tw_Q1UzHgO6c4zPClyAKD6ntBdE35uet8YbmfPcSCA_FxZPpLWqKOrgfG7ZJuJq2m6QV1yVdUu04EsSqhAjdgWe1oetuOpPPp0w72r",
      video: <img
        src="http://192.168.1.30:8080/video"
        alt="Camera Stream"
        style={{ width: '100%', maxWidth: 600 }}
      />
    },
    {
      id: 2,
      name: "Parking Lot P-2A",
      status: "REC",
      statusColor: "text-green-400",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAo4x7dQAisVzRpXxGy82xtwgQq4oNv39orR1SNDZqQoXLHaVJMzGT3_4c8pbavJb6MN17eqkjwQWPmIK7S3-MkatdFTjTvPC-CKtmxby4XMsh6LpnDFmbaruXdoEIcuQcXaL1hiPNLti6CehG1pAO2O8bAMeGBtiXvuCPyw5tw_Q1UzHgO6c4zPClyAKD6ntBdE35uet8YbmfPcSCA_FxZPpLWqKOrgfG7ZJuJq2m6QV1yVdUu04EsSqhAjdgWe1oetuOpPPp0w72r"
    },
    {
      id: 3,
      name: "East Perimeter",
      status: "REC",
      statusColor: "text-green-400",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBgwTFA0dhtSBwM9CKSLNuJWwGzNeCwl0h_v2t6iuf_DMTW7ZioniTW9WFBxGkKR3KQgXSjdJkZ7IlKGDqHP51r1n1T0BqUNdPaU_dM5FXL7TxEK4Dfcd-nzYp6aJybgoMXf-Sy1aKml_OcJ5J2caauPpgvZ_s8eIA7IiG6DafODIz8Y952EX9uRBgK3YmauRYoHO92HQ_2A9nLw_oatUoC-M912JDP9cp05KhEOo78skOlJBgEnLGb-W_ipHPDjoKheYtjtbIFF80"
    },
    {
      id: 4,
      name: "Server Room",
      status: "CONNECTION ISSUE",
      statusColor: "text-yellow-400",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7uzIeXt9jCtcBkBP6H_7Cuu1FtBrf6y5ckXn87lLLMNn8_67__KH1LBQV9nl70pT2gIvGyI5ijUjs8nlIbxTmScmfIpLdevlReJYe3DJDINpxdzhQeCIQG81fmKQx4IAv8GXty0rO0VYMZpoxU6Om13Wr6SD4jfOfML-u8P2ptc2RD3jG5wFLp6DsoY2CPtDipmZNHKfqW_x15ScYX99t0M51uvkTwFGvtZ9EmNhUYi2zwArxtqMF-VviJdkqrRVXZqbZaVZEuQPt"
    }
  ];

  // ==== Navigate Function ====
  const handleCameraClick = (location: string) => {
    navigate(`/cameras/${location}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Action Buttons */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="absolute top-6 right-6 z-10 flex items-center space-x-2 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200/20 dark:border-gray-800/60 shadow-lg">
          <button className="flex items-center justify-center w-10 h-10 rounded text-gray-600 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary">
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded text-gray-600 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary">
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
          <button className="flex items-center justify-center w-10 h-10 rounded text-gray-600 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary">
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
        </div>

        {/* ==== Cameras Grid ==== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cameras.map((cam) => (
            <div
              key={cam.id}
              onClick={() => handleCameraClick(cam.name)}
              className="relative group aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg cursor-pointer"
            > 
              {cam.video || <img src={cam.img} alt={cam.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Camera Info */}
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="font-bold text-white">{cam.name}</h3>
                <p className={`text-xs flex items-center ${cam.statusColor}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${cam.statusColor.replace("text", "bg")} animate-pulse`} />
                  {cam.status}
                </p>
              </div>

              {/* Alert Badge */}
              {cam.alert && (
                <div className="absolute top-4 right-4 px-2 py-1 text-xs font-bold text-white bg-red-600 rounded">
                  ALERT
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-6 py-2 dark:bg-background-dark/50 border-t border-gray-200/10 dark:border-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
        <span>
          Operator: <span className="font-semibold text-green-300">Azwa Nawaz</span>
        </span>
      </footer>
    </div>
  );
}
