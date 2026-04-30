import ky from "ky";
import { useAuthStore } from "@/store/auth.store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = ky.create({
  prefixUrl: API_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = useAuthStore.getState().token;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
      },
    ],
  },
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post("auth/login", { json: { email, password } }).json<{
      token: string;
      user: { id: number; username: string; email: string; role: string };
    }>(),
  forgotPassword: (email: string) =>
    api.post("auth/forgot-password", { json: { email } }).json(),
  resetPassword: (token: string, password: string) =>
    api.post("auth/reset-password", { json: { token, password } }).json(),
};

export const profileApi = {
  get: () =>
    api.get("profile").json<{
      id: number;
      username: string;
      email: string;
      role: string;
      created_at: string;
    }>(),
  update: (data: {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }) =>
    api.put("profile", { json: data }).json<{
      token: string;
      user: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }>(),
};

export const runesApi = {
  import: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("runes/import", { body: formData }).json<{
      import_id: number;
      wizard_name: string;
      rune_count: number;
    }>();
  },
  getAverages: (params: {
    set_id?: number;
    slot_no?: number;
    pri_stat?: number;
    min_upgrade?: number;
    is_ancient?: boolean;
    refresh?: boolean;
  }) =>
    api
      .get("runes/averages", {
        searchParams: Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined),
        ) as Record<string, string | number | boolean>,
      })
      .json<{
        set_id: number | null;
        slot_no: number | null;
        pri_stat_filter: number | null;
        averages: Array<{
          stat_id: number;
          stat_code: string;
          stat_name_fr: string;
          is_percent: boolean;
          avg_base: number;
          avg_with_grind: number;
          rune_count: number;
        }>;
      }>(),
};

export const statsApi = {
  getTopSets: (limit = 5) =>
    api.get("stats/top-sets", { searchParams: { limit } }).json<
      Array<{
        set_id: number;
        set_name: string;
        rune_count: number;
      }>
    >(),
  getTop3ByStat: (statCode: string, minPct = 10) =>
    api
      .get("stats/top3-by-stat", {
        searchParams: { stat_code: statCode, min_pct: minPct },
      })
      .json<
        Array<{
          set_id: number;
          set_name: string;
          avg_base: number;
          avg_with_grind: number;
          rune_count: number;
          is_percent: boolean;
          pct: number;
        }>
      >(),
  getTotalRunes: () =>
    api.get("stats/total-runes").json<{ total_runes: number }>(),
  getAvailablePriStats: (setId: number) =>
    api
      .get("stats/available-pri-stats", {
        searchParams: { set_id: setId },
      })
      .json<
        Record<
          string,
          Array<{
            stat_id: number;
            stat_code: string;
            stat_name: string;
            rune_count: number;
          }>
        >
      >(),
};

export const adminApi = {
  getUsers: () =>
    api.get("admin/users").json<
      Array<{
        id: number;
        username: string;
        email: string;
        role: string;
        is_active: boolean;
        created_at: string;
      }>
    >(),
  createUser: (data: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }) => api.post("admin/users", { json: data }).json(),
  updateUser: (
    id: number,
    data: Partial<{
      username: string;
      email: string;
      password: string;
      role: string;
      isActive: boolean;
    }>,
  ) => api.put(`admin/users/${id}`, { json: data }).json(),
  deleteUser: (id: number) => api.delete(`admin/users/${id}`).json(),
};

// ── Artefacts ────────────────────────────────────────────────────────────────

export type ArtifactAverage = {
  effect_id: number;
  avg_value: number;
  max_value: number;
  artifact_count: number;
};

export type ArtifactAveragesResponse = {
  filters: {
    type: number | null;
    attribute: number | null;
    unit_style: number | null;
    pri_effect_id: number | null;
    min_level: number | null;
  };
  artifact_count: number;
  averages: ArtifactAverage[];
};

export type ArtifactStatsResponse = {
  total: number;
  by_type: { elemental: number; style: number };
  by_attribute: {
    fire: number;
    water: number;
    wind: number;
    light: number;
    dark: number;
  };
  by_unit_style: { atk: number; def: number; hp: number; support: number };
  by_pri_effect: { hp: number; atk: number; def: number };
};

export const artifactsApi = {
  getAverages: (params: {
    type?: number;
    attribute?: number;
    unit_style?: number;
    pri_effect_id?: number;
    min_level?: number;
  }) =>
    api
      .get("artifacts/averages", {
        searchParams: Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined),
        ) as Record<string, string | number>,
      })
      .json<ArtifactAveragesResponse>(),

  getStats: () =>
    api.get("artifacts/stats").json<ArtifactStatsResponse>(),
};
