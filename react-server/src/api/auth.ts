import api from "./axios";

export interface UserOut {
  id?: string;
  username: string;
  email: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface SignupParams {
  username: string;
  email: string;
  password: string;
}

export async function loginUserAPI(params: LoginParams): Promise<Token> {
  try {
    const formData = new URLSearchParams();
    formData.append('username', params.username);
    formData.append('password', params.password);
    formData.append('grant_type', 'password'); // Optional but usually required for OAuth2 password grant

    const response = await api.post<Token>('auth/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function signupUserAPI(params: SignupParams): Promise<UserOut> {
  try {
    const response = await api.post<UserOut>('auth/register', params);
    return response.data;
  } catch (error) {
    console.error('Signup failed:', error);
    throw error;
  }
}
