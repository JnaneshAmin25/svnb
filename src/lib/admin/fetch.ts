export type ApiState = "idle" | "loading" | "success" | "empty" | "error";

export type ApiEnvelope<T> = {
  state: ApiState;
  message?: string;
  data?: T;
  error?: {
    code: string;
    detail?: string;
  };
};

export async function fetchAdminJSON<T>(input: string, init?: RequestInit): Promise<ApiEnvelope<T>> {
  try {
    const response = await fetch(input, {
      method: init?.method || "GET",
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "include",
    });

    const body = (await response.json().catch(() => ({}))) as ApiEnvelope<T> | null;
    if (!response.ok) {
      return {
        state: "error",
        message: body?.message || "Request failed",
        error: body?.error || { code: "REQUEST_FAILED", detail: `HTTP ${response.status}` },
      };
    }
    return body || { state: "empty", message: "No response body" };
  } catch {
    return {
      state: "error",
      message: "Network error",
      error: { code: "NETWORK_ERROR", detail: "Failed to contact server" },
    };
  }
}

export async function postFormData(
  input: string,
  formData: FormData,
): Promise<ApiEnvelope<Record<string, unknown>>> {
  try {
    const response = await fetch(input, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const body = (await response.json().catch(() => ({}))) as ApiEnvelope<Record<string, unknown>> | null;
    if (!response.ok) {
      return {
        state: "error",
        message: body?.message || "Request failed",
        error: body?.error || { code: "REQUEST_FAILED", detail: `HTTP ${response.status}` },
      };
    }
    return body || { state: "empty", message: "No response body" };
  } catch {
    return {
      state: "error",
      message: "Network error",
      error: { code: "NETWORK_ERROR", detail: "Failed to contact server" },
    };
  }
}
