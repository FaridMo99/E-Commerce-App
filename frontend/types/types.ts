export type AccessToken = string;

export type SeachParams = { [key: string]: string };

//placeholder types
export type User = { name: string };
export type AuthResponse = { accessToken: AccessToken; user: User };
