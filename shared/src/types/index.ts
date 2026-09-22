export enum UserRole {
  ARTISAN = "ARTISAN",
  BUYER = "BUYER",
  ADMIN = "ADMIN"
}

export enum CraftCategory {
  POTTERY = "POTTERY",
  WEAVING_TEXTILES = "WEAVING_TEXTILES",
  WOODWORK = "WOODWORK",
  METAL_CRAFT = "METAL_CRAFT",
  JEWELRY = "JEWELRY",
  PAINTING = "PAINTING",
  LEATHER = "LEATHER",
  EMBROIDERY = "EMBROIDERY",
  BAMBOO_CANE = "BAMBOO_CANE",
  OTHER = "OTHER"
}

export enum SupportedLanguage {
  EN = "en",
  TA = "ta",
  HI = "hi"
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  preferredLanguage: SupportedLanguage;
  location?: string;
  craftCategory?: CraftCategory;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterArtisanDto {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  preferredLanguage: SupportedLanguage;
  location?: string;
  craftCategory?: CraftCategory;
}

export interface RegisterBuyerDto {
  name: string;
  email: string;
  password?: string;
  preferredLanguage?: SupportedLanguage;
}

export interface LoginDto {
  identifier: string; // email or phone
  password?: string;
}

export interface GoogleAuthDto {
  idToken: string;
  role?: UserRole;
}
