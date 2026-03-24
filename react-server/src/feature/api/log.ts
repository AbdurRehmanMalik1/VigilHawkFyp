import api from "../axios";

export interface LogEntry {
  timestamp: string;
  event_type: string;
  source: string;
  description: string;
  status: string;
  reference_id?: string;
}

export interface GetMyLogsResponse {
  total: number;
  limit: number;
  skip: number;
  data: LogEntry[];
}


export interface GetMyLogsParams {
    limit: 20 | 50 | 100; 
    skip: number
}

/**
 * Fetch logs for the current user
 * @param limit Number of logs to fetch (20, 50, 100)
 * @param skip Number of logs to skip (for pagination)
 */
export async function getMyLogsAPI({
  limit = 20,
  skip = 0,
}: GetMyLogsParams) {
  try {
    const response = await api.get("/logs/me", {
      params: { limit, skip },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch logs:");
    throw error;
  }
}


export interface AlertItem {
  id: string;
  priority: "High" | "Medium" | "Low";
  camera: string;
  location: string;
  time: string;
  confidence: number;
  violation_reasons: string[];
  imageUrl?: string;
  camera_id: string;
}

export interface FetchAlertsParams {
  limit: number;
  skip: number;
  searchString: string;
}

// API function
export async function fetchAlertsAPI(params: FetchAlertsParams) {
  try {
    const response = await api.get<AlertItem[]>("/logs/alerts", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    throw error;
  }
}


export interface DeleteAlertsPayload {
  alert_ids: string[];
}


export async function deleteAlertsAPI(payload: DeleteAlertsPayload) {
  try {
    const response = await api.delete("/logs/alerts/clear", {
      data: payload, // 👈 IMPORTANT: axios uses `data` for DELETE body
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete alerts:", error);
    throw error;
  }
}

export async function deleteSingleAlertAPI(alertId: string) {
  try {
    const response = await api.delete(`/logs/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete alert:", error);
    throw error;
  }
}