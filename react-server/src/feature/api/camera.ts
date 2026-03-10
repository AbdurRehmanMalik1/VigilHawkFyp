
import api from "../axios";

export interface CameraOut {
  id: string;
  name: string;
  location: string;
  url: string;
  created_at: string;
  registered_by: string;
  status: string
}

export interface CameraConfiguration {
  camera_id: string;
  ai_detection: boolean;
  persons_allowed: number;
  alert_priority: "High" | "Medium" | "Low";
  dashboard_alerts: boolean;
  email_alerts: boolean;
  allowed_time_range_from?: string; // "HH:MM" or null
  allowed_time_range_to?: string;   // "HH:MM" or null
}


export async function getRegisteredCamerasAPI(): Promise<CameraOut[]> {
  try {
    const response = await api.get<CameraOut[]>("camera/");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch cameras:", error);
    throw error;
  }
}



export interface CameraRegisterPayload {
  name: string;
  location: string;
  url: string;
}

export async function registerCameraAPI(
  payload: CameraRegisterPayload
): Promise<CameraOut> {
  try {
    const response = await api.post<CameraOut>("camera/", payload);
    return response.data;
  } catch (error: any) {
    console.error("Failed to register camera:", error);
    // You can extract message more gracefully depending on error shape
    throw error?.response?.data?.detail || error.message || "Failed to register camera";
  }
}

export async function getCameraByIdAPI(cameraId: string): Promise<CameraOut> {
  try {
    const response = await api.get<CameraOut>(`camera/${cameraId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch camera:", error);
    throw error?.response?.data?.detail || error.message || "Failed to fetch camera";
  }
}

export async function updateCameraAPI(id: string, data: Partial<Omit<CameraOut, "id" | "created_at" | "registered_by">>): Promise<CameraOut> {
  try {
    // Use PATCH if you want partial update, or PUT for full replace
    const response = await api.patch<CameraOut>(`/camera/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to update camera:", error);
    throw error;
  }
}

export interface StartCameraResponse {
  status: string; // e.g. "started"
  camera_url: string;
  camera_id: string;
}


export async function startCameraAPI(cameraId: string): Promise<StartCameraResponse> {
  try {
    const response = await api.post<StartCameraResponse>(`camera/start/${cameraId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to start camera:", error);
    throw error?.response?.data?.detail || error.message || "Failed to start camera";
  }
}

export async function startCameraDirectAPI(cameraId: string): Promise<StartCameraResponse> {
  try {
    const response = await api.post<StartCameraResponse>(`camera/start_direct/${cameraId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to start DIRECT camera:", error);
    throw error?.response?.data?.detail || error.message || "Failed to start DIRECT camera";
  }
}

export async function stopCameraAPI(cameraId: string): Promise<{ status: string; camera_id: string }> {
  try {
    const response = await api.post<{ status: string; camera_id: string }>(`camera/stop/${cameraId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to stop camera:", error);
    throw error?.response?.data?.detail || error.message || "Failed to stop camera";
  }
}

// Delete single camera
export async function deleteSingleCameraAPI(cameraId: string): Promise<{ status: string; camera_id: string }> {
  try {
    const response = await api.delete<{ status: string; camera_id: string }>(`camera/${cameraId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete camera:", error);
    throw error?.response?.data?.detail || error.message || "Failed to delete camera";
  }
}

// Delete all cameras for user
export async function deleteAllCamerasAPI(): Promise<{ status: string; deleted_count: number }> {
  try {
    const response = await api.delete<{ status: string; deleted_count: number }>("camera/");
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete all cameras:", error);
    throw error?.response?.data?.detail || error.message || "Failed to delete all cameras";
  }
}



export async function getCameraConfigurationAPI(cameraId: string): Promise<CameraConfiguration> {
  try {
    const response = await api.get<CameraConfiguration>(`camera/config/${cameraId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch camera configuration:", error);
    throw error;
  }
}

// Update camera configuration
export async function updateCameraConfigurationAPI(
  cameraId: string,
  data: Partial<Omit<CameraConfiguration, "camera_id">>
): Promise<CameraConfiguration> {
  try {
    const response = await api.patch<CameraConfiguration>(`camera/config/${cameraId}`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update camera configuration:", error);
    throw error;
  }
}
