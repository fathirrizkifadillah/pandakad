/**
 * Typed API Client terstandarisasi untuk frontend PANDAKAD.
 * Menerapkan disiplin frontend-data-contracts: satu fetch boundary, unwrapping envelope, dan normalisasi error ApiError.
 */

export class ApiError extends Error {
	public readonly status: number;
	public readonly code: string;
	public readonly details?: unknown;

	constructor(
		message: string,
		status = 500,
		code = "INTERNAL_ERROR",
		details?: unknown,
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

export interface RequestOptions extends RequestInit {
	params?: Record<string, string | number | boolean | undefined>;
}

export const apiClient = {
	async request<T>(
		method: string,
		path: string,
		body?: unknown,
		options: RequestOptions = {},
	): Promise<T> {
		const { params, headers, ...customConfig } = options;

		let url = path;
		if (params) {
			const searchParams = new URLSearchParams();
			for (const [key, val] of Object.entries(params)) {
				if (val !== undefined && val !== null) {
					searchParams.append(key, String(val));
				}
			}
			const qs = searchParams.toString();
			if (qs) {
				url += (url.includes("?") ? "&" : "?") + qs;
			}
		}

		const config: RequestInit = {
			method,
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				...headers,
			},
			credentials: "include", // Mengirimkan dan menerima signed session cookie ke backend
			...customConfig,
		};

		if (body !== undefined) {
			config.body = JSON.stringify(body);
		}

		let response: Response;
		try {
			response = await fetch(url, config);
		} catch (networkError) {
			throw new ApiError(
				"Tidak dapat terhubung ke server backend PANDAKAD. Pastikan server backend sedang aktif pada port 5000.",
				0,
				"NETWORK_DISCONNECTED",
				networkError,
			);
		}

		if (!response.ok) {
			let errorPayload: {
				error?: { code?: string; message?: string; details?: unknown };
			} | null = null;
			try {
				errorPayload = await response.json();
			} catch {
				// Respons bukan JSON
			}

			const code = errorPayload?.error?.code || `HTTP_${response.status}`;
			const message =
				errorPayload?.error?.message ||
				response.statusText ||
				"Terjadi kesalahan saat memproses permintaan ke server.";

			throw new ApiError(
				message,
				response.status,
				code,
				errorPayload?.error?.details,
			);
		}

		// Respons 204 No Content
		if (response.status === 204) {
			return null as unknown as T;
		}

		const json = await response.json();
		// Unwrapping envelope standar data
		return (json.data !== undefined ? json.data : json) as T;
	},

	get<T>(path: string, options?: RequestOptions): Promise<T> {
		return this.request<T>("GET", path, undefined, options);
	},

	post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>("POST", path, body, options);
	},

	put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>("PUT", path, body, options);
	},

	patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>("PATCH", path, body, options);
	},

	delete<T>(path: string, options?: RequestOptions): Promise<T> {
		return this.request<T>("DELETE", path, undefined, options);
	},
};
