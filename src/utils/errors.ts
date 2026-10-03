import axios from "axios";

interface ApiErrorBody {
  message?: string;
  errors?: { field: string; message: string }[];
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "Cannot reach the server. Check your internet connection and the API URL.";
    }
    const data = error.response.data;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join("\n");
    if (data?.message) return data.message;
  }
  return "Something went wrong. Please try again.";
}
