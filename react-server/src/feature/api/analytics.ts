import api from "../axios";


export async function getAnalyticsAPI(start?: Date, end?: Date) {
  try {
    const params: Record<string, string> = {};
    if (start) params.start = start.toISOString();
    if (end) params.end = end.toISOString();

    const response = await api.get("/analytics", { params });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    throw error;
  }
}