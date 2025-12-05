import api from "../axios";

export interface SafeUser {
  id?: string;   
  username: string;
  email: string;
}


export async function fetchCurrentUserAPI(): Promise<SafeUser> {
  const response = await api.get<SafeUser>('/user/me');
  return response.data;
}