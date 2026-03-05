import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("accessToken");
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const refreshResult: any = await baseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions,
      );
      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefresh } = refreshResult.data;
        localStorage.setItem("accessToken", accessToken);
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
        result = await baseQuery(args, api, extraOptions);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
  }

  return result;
};

// ─── Shared Types ─────────────────────────────────────────────────────────────

/** Matches your User mongoose schema */
export interface UserRecord {
  _id: string;
  name?: string;
  email: string;
  role: "student" | "staff" | "admin";
  createdAt: string;
  updatedAt: string;
}

/** Payload for creating a single user (mirrors your register controller) */
export interface CreateUserPayload {
  name?: string;
  email: string;
  password: string;
  role?: "student" | "staff";
}

/** One row result from a bulk import */
export interface BulkRowResult {
  row: number;
  email: string;
  name?: string;
  success: boolean;
  error?: string;
  userId?: string;
}

/** Response returned by POST /admin/users/bulk */
export interface BulkUploadResponse {
  imported: number;
  failed: number;
  results: BulkRowResult[];
}

/** Query params for GET /admin/users */
export interface GetUsersParams {
  role?: "student" | "staff" | "admin";
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/** Paginated response for GET /admin/users */
export interface GetUsersResponse {
  users: UserRecord[];
  total: number;
  page: number;
  totalPages: number;
}

// ─── API Slice ────────────────────────────────────────────────────────────────

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Issues", "Comments", "AdminAnalytics", "Users"],
  endpoints: (builder) => ({
    // ─── Auth ──────────────────────────────────────────────────────────────
    register: builder.mutation<
      any,
      { name?: string; email: string; password: string }
    >({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: builder.mutation<any, { refreshToken: string }>({
      query: (body) => ({ url: "/auth/logout", method: "POST", body }),
    }),
    me: builder.query<any, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
    }),

    // ─── User Management (Admin) ───────────────────────────────────────────
    //
    // GET /api/admin/users
    //   ?role=student|teacher|admin
    //   &search=<string>        — searches name + email
    //   &page=1&limit=10
    //   &sort=createdAt&order=desc
    //
    // Returns: { users, total, page, totalPages }
    getUsers: builder.query<GetUsersResponse, GetUsersParams | void>({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params && "role" in params && params.role)
          qs.append("role", params.role);
        if (params && "search" in params && params.search)
          qs.append("search", params.search);
        if (params && "page" in params && params.page)
          qs.append("page", String(params.page));
        if (params && "limit" in params && params.limit)
          qs.append("limit", String(params.limit));
        if (params && "sort" in params && params.sort)
          qs.append("sort", params.sort);
        if (params && "order" in params && params.order)
          qs.append("order", params.order);
        const q = qs.toString();
        return `/admin/users${q ? `?${q}` : ""}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({
                type: "Users" as const,
                id: _id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    // GET /api/admin/users/:id
    // Returns: { user: UserRecord }
    getUserById: builder.query<{ user: UserRecord }, string>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    // POST /api/admin/users
    // Body: { name?, email, password, role? }
    // Uses the same bcrypt + User.create logic as your register controller
    // Returns: { id, email, name, role }
    createUser: builder.mutation<
      { id: string; email: string; name?: string; role: string },
      CreateUserPayload
    >({
      query: (body) => ({ url: "/admin/users", method: "POST", body }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    // POST /api/admin/users/bulk
    // Body: { users: CreateUserPayload[] }
    // Server iterates the array, calls the same register logic per row,
    // and collects per-row success/error without aborting on first failure.
    // Returns: { imported, failed, results: BulkRowResult[] }
    bulkCreateUsers: builder.mutation<BulkUploadResponse, CreateUserPayload[]>({
      query: (users) => ({
        url: "/admin/users/bulk",
        method: "POST",
        body: { users },
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    // PUT /api/admin/users/:id
    // Body: any subset of { name, email, role }  — password NOT allowed here;
    // use a dedicated change-password endpoint for that.
    // Returns: { user: UserRecord }
    updateUser: builder.mutation<
      { user: UserRecord },
      { id: string; name?: string; email?: string; role?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // DELETE /api/admin/users/:id
    // Returns: { ok: true }
    deleteUser: builder.mutation<{ ok: boolean }, string>({
      query: (id) => ({ url: `/admin/users/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    // ─── Issues (shared) ──────────────────────────────────────────────────
    getIssues: builder.query<any, void>({
      query: () => "/issues",
      providesTags: ["Issues"],
    }),
    submitIssue: builder.mutation<any, Partial<any>>({
      query: (body) => ({ url: "/issues", method: "POST", body }),
      invalidatesTags: ["Issues", "AdminAnalytics"],
    }),
    getRecentIssues: builder.query<any[], void>({
      query: () => "/issues/recent",
      providesTags: ["Issues"],
    }),
    getIssueStats: builder.query<any, void>({
      query: () => "/issues/stats",
      providesTags: ["Issues"],
    }),
    searchStaffs: builder.query<any[], string | void>({
      query: (search) => ({
        url: `/staffs/search${search ? `?search=${encodeURIComponent(search)}` : ""}`,
        method: "GET",
      }),
    }),

    // ─── Student: Notifications ───────────────────────────────────────────
    getNotifications: builder.query<
      Array<{
        _id: string;
        message: string;
        read: boolean;
        issueId: string;
        createdAt: string;
      }>,
      { limit?: number } | void
    >({
      query: ({ limit = 4 } = {}) => `/issues/notifications?limit=${limit}`,
      providesTags: ["Issues"],
    }),

    // ─── Student: Activity Timeline ───────────────────────────────────────
    getIssueTimeline: builder.query<
      Array<{
        _id: string;
        action: string;
        issueTitle: string;
        issueId: string;
        type: string;
        createdAt: string;
      }>,
      { limit?: number } | void
    >({
      query: ({ limit = 5 } = {}) => `/issues/timeline?limit=${limit}`,
      providesTags: ["Issues"],
    }),

    // ─── Staff: Dashboard Stats ───────────────────────────────────────────
    getStaffDashboardStats: builder.query<
      {
        totalGrievances: number;
        resolved: number;
        inProgress: number;
        open: number;
        escalated: number;
        newThisWeek: number;
        assignedToMe: number;
        byStatus: Array<{ _id: string; count: number }>;
        byPriority: Array<{ _id: string; count: number }>;
        byCategory: Array<{ _id: string; count: number }>;
      },
      void
    >({
      query: () => "/issues/staff/dashboard-stats",
      providesTags: ["Issues"],
    }),

    // ─── Staff: Assigned Grievances ───────────────────────────────────────
    getAssignedGrievances: builder.query<
      any[],
      {
        status?: string;
        priority?: string;
        sort?: string;
        limit?: number;
      } | void
    >({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params && "status" in params && params.status)
          qs.append("status", params.status);
        if (params && "priority" in params && params.priority)
          qs.append("priority", params.priority);
        if (params && "sort" in params && params.sort)
          qs.append("sort", params.sort);
        if (params && "limit" in params && params.limit)
          qs.append("limit", String(params.limit));
        const query = qs.toString();
        return `/issues/staff/assigned${query ? `?${query}` : ""}`;
      },
      providesTags: ["Issues"],
    }),

    // ─── Staff: Escalated Issues ──────────────────────────────────────────
    getEscalatedIssues: builder.query<
      Array<{
        _id: string;
        title: string;
        status: string;
        priority: string;
        category: string;
        createdAt: string;
        updatedAt: string;
      }>,
      void
    >({
      query: () => "/issues/staff/escalated",
      providesTags: ["Issues"],
    }),

    // ─── Staff: Department Stats ──────────────────────────────────────────
    getDepartmentStats: builder.query<
      Array<{
        _id: string;
        open: number;
        inProgress: number;
        resolved: number;
        total: number;
      }>,
      void
    >({
      query: () => "/issues/staff/departments",
      providesTags: ["Issues"],
    }),

    // ─── Staff: Activity Feed ─────────────────────────────────────────────
    getStaffActivity: builder.query<
      Array<{
        _id: string;
        message: string;
        issueId: string;
        createdAt: string;
      }>,
      { limit?: number } | void
    >({
      query: ({ limit = 4 } = {}) => `/issues/staff/activity?limit=${limit}`,
      providesTags: ["Issues"],
    }),

    // ─── Staff Actions ────────────────────────────────────────────────────
    resolveIssue: builder.mutation<
      any,
      {
        issueId: string;
        resolution?: string;
        status?: string;
        progress?: number;
        escalateToAdmin?: boolean;
        workLogMessage?: string;
      }
    >({
      query: ({ issueId, ...body }) => ({
        url: `/issues/${issueId}/resolve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Issues", "AdminAnalytics"],
    }),

    // ─── Issue CRUD ───────────────────────────────────────────────────────
    getIssueById: builder.query<any, string>({
      query: (issueId) => `/issues/${issueId}`,
      providesTags: (result, error, issueId) => [
        { type: "Issues", id: issueId },
      ],
    }),
    getAssignedIssueById: builder.query<any, string>({
      query: (issueId) => `/issues/staff/assigned/${issueId}`,
      providesTags: (result, error, issueId) => [
        { type: "Issues", id: issueId },
      ],
    }),
    updateIssue: builder.mutation<
      any,
      {
        issueId: string;
        title?: string;
        description?: string;
        category?: string;
        priority?: string;
        status?: string;
        assignedTo?: string;
        progress?: number;
        workLogMessage?: string;
      }
    >({
      query: ({ issueId, ...body }) => ({
        url: `/issues/${issueId}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { issueId }) => [
        { type: "Issues", id: issueId },
        "Issues",
        "AdminAnalytics",
      ],
    }),
    deleteIssue: builder.mutation<any, string>({
      query: (issueId) => ({ url: `/issues/${issueId}`, method: "DELETE" }),
      invalidatesTags: ["Issues", "AdminAnalytics"],
    }),

    // ─── Comments ─────────────────────────────────────────────────────────
    addComment: builder.mutation<any, { issueId: string; comment: string }>({
      query: ({ issueId, comment }) => ({
        url: `/comment/${issueId}/comments`,
        method: "POST",
        body: { comment },
      }),
      invalidatesTags: (result, error, { issueId }) => [
        { type: "Comments", id: issueId },
      ],
    }),
    getComments: builder.query<any[], string>({
      query: (issueId) => `/comment/${issueId}/comments`,
      providesTags: (result, error, issueId) => [
        { type: "Comments", id: issueId },
      ],
    }),

    // ─── Admin Analytics ──────────────────────────────────────────────────
    getAdminDashboardStats: builder.query<
      {
        totalIssues: number;
        resolved: number;
        resolutionRate: number;
        activeTeams: number;
        byStatus: Array<{ _id: string; count: number }>;
        byPriority: Array<{ _id: string; count: number }>;
        byCategory: Array<{ _id: string; count: number }>;
      },
      void
    >({
      query: () => "/admin/analytics/dashboard-stats",
      providesTags: ["AdminAnalytics"],
    }),
    getAdminMonthlyTrends: builder.query<
      Array<{ month: string; issues: number; resolved: number }>,
      number | void
    >({
      query: (months = 7) => ({
        url: "/admin/analytics/monthly-trends",
        params: { months },
      }),
      providesTags: ["AdminAnalytics"],
    }),
    getAdminCategoryDistribution: builder.query<
      Array<{ name: string; value: number; count: number; color: string }>,
      void
    >({
      query: () => "/admin/analytics/category-distribution",
      providesTags: ["AdminAnalytics"],
    }),
    getAdminPriorityOverview: builder.query<
      Array<{ priority: string; count: number; color: string }>,
      void
    >({
      query: () => "/admin/analytics/priority-overview",
      providesTags: ["AdminAnalytics"],
    }),
    getAdminResolutionTime: builder.query<
      Array<{ priority: string; avgDays: number; count?: number }>,
      void
    >({
      query: () => "/admin/analytics/resolution-time",
      providesTags: ["AdminAnalytics"],
    }),
    getAdminStatusBreakdown: builder.query<
      Array<{ name: string; value: number; color: string }>,
      void
    >({
      query: () => "/admin/analytics/status-breakdown",
      providesTags: ["AdminAnalytics"],
    }),
    getAdminRecentIssues: builder.query<
      Array<{
        id: string;
        title: string;
        priority: string;
        status: string;
        time: string;
        category: string;
      }>,
      number | void
    >({
      query: (limit = 10) => ({
        url: "/admin/analytics/recent-issues",
        params: { limit },
      }),
      providesTags: ["AdminAnalytics"],
    }),
    getAdminKeyMetrics: builder.query<
      {
        firstResponseTime: {
          value: string;
          unit: string;
          trend: string;
          percentage: number;
        };
        reopenRate: {
          value: number;
          unit: string;
          trend: string;
          percentage: number;
        };
        satisfaction: {
          value: number;
          unit: string;
          trend: string;
          percentage: number;
        };
      },
      void
    >({
      query: () => "/admin/analytics/key-metrics",
      providesTags: ["AdminAnalytics"],
    }),
    getAdminAllAnalytics: builder.query<
      {
        dashboardStats: any;
        monthlyTrends: any[];
        categoryDistribution: any[];
        priorityOverview: any[];
        resolutionTime: any[];
        statusBreakdown: any[];
        recentIssues: any[];
        keyMetrics: any;
      },
      void
    >({
      query: () => "/admin/analytics/all",
      providesTags: ["AdminAnalytics"],
    }),
  }),
});

export const {
  // Auth
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useLazyMeQuery,
  useMeQuery,

  // User Management (Admin)
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useBulkCreateUsersMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  // Issues (shared)
  useGetIssuesQuery,
  useSubmitIssueMutation,
  useGetRecentIssuesQuery,
  useGetIssueStatsQuery,
  useSearchStaffsQuery,

  // Student
  useGetNotificationsQuery,
  useGetIssueTimelineQuery,

  // Staff
  useGetStaffDashboardStatsQuery,
  useGetAssignedGrievancesQuery,
  useGetAssignedIssueByIdQuery,
  useResolveIssueMutation,
  useGetEscalatedIssuesQuery,
  useGetDepartmentStatsQuery,
  useGetStaffActivityQuery,

  // Issue CRUD
  useGetIssueByIdQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,

  // Comments
  useAddCommentMutation,
  useGetCommentsQuery,

  // Admin Analytics
  useGetAdminDashboardStatsQuery,
  useGetAdminMonthlyTrendsQuery,
  useGetAdminCategoryDistributionQuery,
  useGetAdminPriorityOverviewQuery,
  useGetAdminResolutionTimeQuery,
  useGetAdminStatusBreakdownQuery,
  useGetAdminRecentIssuesQuery,
  useGetAdminKeyMetricsQuery,
  useGetAdminAllAnalyticsQuery,
} = api;
