export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  fullName: string;
  contactNumber: string;
  address: string;
  barangay: string;
  city: string;
  province: string;
  accountStatus: string;
  roles: string[];
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  contactNumber: string;
  address: string;
  barangay?: string;
  city?: string;
  province?: string;
}

export interface TokenValidationResult {
  valid: boolean;
  message: string;
}