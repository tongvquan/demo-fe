import { API_URL } from "./config";

export class ApiError extends Error {
  readonly status: number;
  readonly data?: unknown;

  constructor(
    message: string,
    status: number,
    data?: unknown,
  ) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

const readResponse = async (response: Response): Promise<unknown> => {
  if (response.status === 204) return undefined;

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });
  const data = await readResponse(response);

  if (!response.ok) {
    const message = typeof data === "object" && data !== null && "message" in data
      ? String(data.message)
      : typeof data === "string" && data
        ? data
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, data);
  }

  return data as T;
}

const jsonBody = (body: unknown, headers: Headers) => {
  if (body === undefined || body instanceof FormData || typeof body === "string") {
    return body as BodyInit | undefined;
  }

  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
};

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <TResponse, TBody = unknown>(path: string, body?: TBody, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    return request<TResponse>(path, {
      ...options,
      method: "POST",
      headers,
      body: jsonBody(body, headers),
    });
  },

  put: <TResponse, TBody = unknown>(path: string, body?: TBody, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    return request<TResponse>(path, {
      ...options,
      method: "PUT",
      headers,
      body: jsonBody(body, headers),
    });
  },

  patch: <TResponse, TBody = unknown>(path: string, body?: TBody, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    return request<TResponse>(path, {
      ...options,
      method: "PATCH",
      headers,
      body: jsonBody(body, headers),
    });
  },

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};

