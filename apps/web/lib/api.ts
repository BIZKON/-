import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; full_name?: string; organization_name?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Documents API
export const documentsApi = {
  list: () => api.get("/documents"),
  upload: (formData: FormData) =>
    api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/documents/${id}`),
  status: (id: string) => api.get(`/documents/${id}/status`),
};

// Agents API
export const agentsApi = {
  personas: () => api.get("/agents/personas"),
  boardMeeting: (data: { question: string; personas: string[]; stream?: boolean }) =>
    api.post("/agents/board-meeting", data),
  boardMeetingStream: async function* (data: { question: string; personas: string[] }) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/v1/agents/board-meeting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...data, stream: true }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          yield JSON.parse(line);
        } catch {
          // Skip invalid JSON
        }
      }
    }
  },
};
