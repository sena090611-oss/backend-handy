// Datos públicos del usuario que se devuelven al autenticarse
export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

// Respuesta del endpoint /auth/login
export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterResponse {
  user: AuthUser & { isActive: string };
  message: string;
}