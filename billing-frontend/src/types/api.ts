export interface ApiResponse<T> { success: boolean; message: string | null; data: T; meta: Record<string, unknown> | null; }

export interface ApiErrorResponse { success: false; statusCode: number; message: string | string[]; errors: string[] | null; path: string; timestamp: string; }
