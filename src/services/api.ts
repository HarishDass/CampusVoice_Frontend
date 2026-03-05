import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: "https://campusvoice-backend-5ppk.onrender.com/api",
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

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Issues", "Comments", "AdminAnalytics"],
  endpoints: (builder) => ({
    // ─── Auth ────────────────────────────────────────────────────────────────
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

    // ─── Issues (shared) ─────────────────────────────────────────────────────
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

    // ─── Student: Notifications ───────────────────────────────────────────────
    // GET /api/issues/notifications?limit=4
    // Returns: [{ _id, message, read, issueId, createdAt }]
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

    // ─── Student: Activity Timeline ───────────────────────────────────────────
    // GET /api/issues/timeline?limit=5
    // Returns: [{ _id, action, issueTitle, issueId, type, createdAt }]
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

    // ─── Staff: Dashboard Stats ───────────────────────────────────────────────
    // GET /api/issues/staff/dashboard-stats
    // Returns: { totalGrievances, resolved, inProgress, open, escalated,
    //            newThisWeek, assignedToMe, byStatus, byPriority, byCategory }
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

    // ─── Staff: Assigned Grievances (filterable) ──────────────────────────────
    // GET /api/issues/staff/assigned?status=&priority=&sort=&limit=
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

    // ─── Staff: Escalated Issues ──────────────────────────────────────────────
    // GET /api/issues/staff/escalated
    // Returns: [{ _id, title, status, priority, category, createdAt, updatedAt }]
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

    // ─── Staff: Department Stats ──────────────────────────────────────────────
    // GET /api/issues/staff/departments
    // Returns: [{ _id, open, inProgress, resolved, total }]
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

    // ─── Staff: Activity Feed ─────────────────────────────────────────────────
    // GET /api/issues/staff/activity?limit=4
    // Returns: [{ _id, message, issueId, createdAt }]
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

    // ─── Staff actions ────────────────────────────────────────────────────────
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

    // ─── Issue CRUD ───────────────────────────────────────────────────────────
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
      query: (issueId) => ({
        url: `/issues/${issueId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Issues", "AdminAnalytics"],
    }),

    // ─── Comments ─────────────────────────────────────────────────────────────
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

    // ─── Admin Analytics ──────────────────────────────────────────────────────
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

  // Issues (shared)
  useGetIssuesQuery,
  useSubmitIssueMutation,
  useGetRecentIssuesQuery,
  useGetIssueStatsQuery,
  useSearchStaffsQuery,

  // Student (new)
  useGetNotificationsQuery,
  useGetIssueTimelineQuery,

  // Staff
  useGetStaffDashboardStatsQuery,
  useGetAssignedGrievancesQuery,
  useGetAssignedIssueByIdQuery,
  useResolveIssueMutation,
  useGetEscalatedIssuesQuery, // new
  useGetDepartmentStatsQuery, // new
  useGetStaffActivityQuery, // new

  useGetIssueByIdQuery,
  useUpdateIssueMutation,
  useDeleteIssueMutation,

  useAddCommentMutation,
  useGetCommentsQuery,

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
