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

export function ok<T>(data: T, message = "Success"): ApiEnvelope<T> {
  return { state: "success", message, data };
}

export function empty(message = "No data found"): ApiEnvelope<null> {
  return { state: "empty", message, data: null };
}

export function fail(code: string, detail?: string, message = "Request failed"): ApiEnvelope<null> {
  return { state: "error", message, data: null, error: { code, detail } };
}
