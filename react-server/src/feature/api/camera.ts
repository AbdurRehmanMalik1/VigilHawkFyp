
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