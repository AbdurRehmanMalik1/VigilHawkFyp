import api from "../axios";

export interface UserSettings {
  ai_detection: boolean;
  alert_priority: "Low" | "Medium" | "High" | "Critical";
  dashboard_alerts: boolean;
  email_alerts: boolean;
}


export interface SafeUser {
  id?: string;   
  username: string;
  email: string;
  settings?: UserSettings;
}


export async function fetchCurrentUserAPI(): Promise<SafeUser> {
  const response = await api.get<SafeUser>('/user/me');
  return response.data;
}