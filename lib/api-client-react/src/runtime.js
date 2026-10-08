// ../api-client-react/src/generated/api.ts
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";

// ../api-client-react/src/custom-fetch.js
var baseUrl = "";
var authTokenGetter = null;
var setBaseUrl = (value) => {
  baseUrl = value || "";
};
var setAuthTokenGetter = (value) => {
  authTokenGetter = value;
};
var ApiError = class extends Error {
  constructor(response, data) {
    super(data?.error || data?.message || `Request failed (${response.status}).`);
    this.name = "ApiError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
  }
};
async function customFetch(input, options = {}) {
  const { responseType = "auto", ...init } = options;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (authTokenGetter && !headers.has("Authorization")) {
    const token = await authTokenGetter();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const url = baseUrl && typeof input === "string" && input.startsWith("/") ? baseUrl.replace(/\/$/, "") + input : input;
  const response = await fetch(url, { ...init, headers, credentials: "same-origin" });
  let data = null;
  if (response.status !== 204) {
    const text = await response.text();
    if (text) {
      if (responseType === "json" || response.headers.get("content-type")?.includes("json")) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("The server returned an invalid response.");
        }
      } else data = text;
    }
  }
  if (!response.ok) throw new ApiError(response, data);
  return data;
}

// ../api-client-react/src/generated/api.ts
var withQueryKey = (query, queryKey) => {
  const result = { queryKey };
  for (const key of Object.keys(query)) {
    if (key === "queryKey") continue;
    Object.defineProperty(result, key, {
      enumerable: true,
      configurable: true,
      get: () => query[key]
    });
  }
  return result;
};
var getRequestMediaUploadUrl = () => {
  return `/api/storage/uploads/request-url`;
};
var requestMediaUpload = async (requestMediaUploadBody, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getRequestMediaUploadUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(requestMediaUploadBody)
    }
  );
};
var getRequestMediaUploadMutationKey = () => ["requestMediaUpload"];
var getRequestMediaUploadMutationOptions = (options) => {
  const mutationKey = getRequestMediaUploadMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return requestMediaUpload(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useRequestMediaUpload = (options) => {
  return useMutation(getRequestMediaUploadMutationOptions(options));
};
var getGetMediaObjectUrl = (id) => {
  return `/api/storage/objects/${id}`;
};
var getMediaObject = async (id, options) => {
  return customFetch(
    getGetMediaObjectUrl(id),
    {
      ...options,
      method: "GET"
    }
  );
};
var getGetMediaObjectQueryKey = (id) => {
  return [
    `/api/storage/objects/${id}`
  ];
};
var getGetMediaObjectQueryOptions = (id, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetMediaObjectQueryKey(id);
  const queryFn = ({ signal }) => getMediaObject(id, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: id !== null && id !== void 0, ...queryOptions };
};
function useGetMediaObject(id, options) {
  const queryOptions = getGetMediaObjectQueryOptions(id, options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getHealthCheckUrl = () => {
  return `/api/healthz`;
};
var healthCheck = async (options) => {
  return customFetch(
    getHealthCheckUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
var getHealthCheckQueryKey = () => {
  return [
    `/api/healthz`
  ];
};
var getHealthCheckQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn = ({ signal }) => healthCheck({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useHealthCheck(options) {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getListContentUrl = (kind, params) => {
  const normalizedParams = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== void 0) {
      normalizedParams.append(key, value === null ? "null" : String(value));
    }
  });
  const stringifiedParams = normalizedParams.toString();
  return stringifiedParams.length > 0 ? `/api/catalog/${kind}?${stringifiedParams}` : `/api/catalog/${kind}`;
};
var listContent = async (kind, params, options) => {
  return customFetch(
    getListContentUrl(kind, params),
    {
      ...options,
      method: "GET"
    }
  );
};
var getListContentQueryKey = (kind, params) => {
  return [
    `/api/catalog/${kind}`,
    ...params ? [params] : []
  ];
};
var getListContentQueryOptions = (kind, params, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListContentQueryKey(kind, params);
  const queryFn = ({ signal }) => listContent(kind, params, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: kind !== null && kind !== void 0, ...queryOptions };
};
function useListContent(kind, params, options) {
  const queryOptions = getListContentQueryOptions(kind, params, options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getGetContentUrl = (kind, slug) => {
  return `/api/catalog/${kind}/${slug}`;
};
var getContent = async (kind, slug, options) => {
  return customFetch(
    getGetContentUrl(kind, slug),
    {
      ...options,
      method: "GET"
    }
  );
};
var getGetContentQueryKey = (kind, slug) => {
  return [
    `/api/catalog/${kind}/${slug}`
  ];
};
var getGetContentQueryOptions = (kind, slug, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetContentQueryKey(kind, slug);
  const queryFn = ({ signal }) => getContent(kind, slug, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: kind !== null && kind !== void 0 && slug !== null && slug !== void 0, ...queryOptions };
};
function useGetContent(kind, slug, options) {
  const queryOptions = getGetContentQueryOptions(kind, slug, options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getGetDiscoveryUrl = () => {
  return `/api/discovery`;
};
var getDiscovery = async (options) => {
  return customFetch(
    getGetDiscoveryUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
var getGetDiscoveryQueryKey = () => {
  return [
    `/api/discovery`
  ];
};
var getGetDiscoveryQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetDiscoveryQueryKey();
  const queryFn = ({ signal }) => getDiscovery({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetDiscovery(options) {
  const queryOptions = getGetDiscoveryQueryOptions(options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getSubmitLeadUrl = () => {
  return `/api/leads`;
};
var submitLead = async (leadInput, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getSubmitLeadUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(leadInput)
    }
  );
};
var getSubmitLeadMutationKey = () => ["submitLead"];
var getSubmitLeadMutationOptions = (options) => {
  const mutationKey = getSubmitLeadMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return submitLead(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useSubmitLead = (options) => {
  return useMutation(getSubmitLeadMutationOptions(options));
};
var getAskAcadBotUrl = () => {
  return `/api/chat`;
};
var askAcadBot = async (chatInput, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getAskAcadBotUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(chatInput)
    }
  );
};
var getAskAcadBotMutationKey = () => ["askAcadBot"];
var getAskAcadBotMutationOptions = (options) => {
  const mutationKey = getAskAcadBotMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return askAcadBot(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useAskAcadBot = (options) => {
  return useMutation(getAskAcadBotMutationOptions(options));
};
var getGetAdminSessionUrl = () => {
  return `/api/admin/session`;
};
var getAdminSession = async (options) => {
  return customFetch(
    getGetAdminSessionUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
var getGetAdminSessionQueryKey = () => {
  return [
    `/api/admin/session`
  ];
};
var getGetAdminSessionQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetAdminSessionQueryKey();
  const queryFn = ({ signal }) => getAdminSession({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetAdminSession(options) {
  const queryOptions = getGetAdminSessionQueryOptions(options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getAdminLoginUrl = () => {
  return `/api/admin/login`;
};
var adminLogin = async (loginInput, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getAdminLoginUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(loginInput)
    }
  );
};
var getAdminLoginMutationKey = () => ["adminLogin"];
var getAdminLoginMutationOptions = (options) => {
  const mutationKey = getAdminLoginMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return adminLogin(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useAdminLogin = (options) => {
  return useMutation(getAdminLoginMutationOptions(options));
};
var getAdminLogoutUrl = () => {
  return `/api/admin/logout`;
};
var adminLogout = async (options) => {
  return customFetch(
    getAdminLogoutUrl(),
    {
      ...options,
      method: "POST"
    }
  );
};
var getAdminLogoutMutationKey = () => ["adminLogout"];
var getAdminLogoutMutationOptions = (options) => {
  const mutationKey = getAdminLogoutMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = () => {
    return adminLogout(requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useAdminLogout = (options) => {
  return useMutation(getAdminLogoutMutationOptions(options));
};
var getChangeAdminPasswordUrl = () => {
  return `/api/admin/password`;
};
var changeAdminPassword = async (passwordInput, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getChangeAdminPasswordUrl(),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(passwordInput)
    }
  );
};
var getChangeAdminPasswordMutationKey = () => ["changeAdminPassword"];
var getChangeAdminPasswordMutationOptions = (options) => {
  const mutationKey = getChangeAdminPasswordMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { data } = props ?? {};
    return changeAdminPassword(data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useChangeAdminPassword = (options) => {
  return useMutation(getChangeAdminPasswordMutationOptions(options));
};
var getGetAdminDashboardUrl = () => {
  return `/api/admin/dashboard`;
};
var getAdminDashboard = async (options) => {
  return customFetch(
    getGetAdminDashboardUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
var getGetAdminDashboardQueryKey = () => {
  return [
    `/api/admin/dashboard`
  ];
};
var getGetAdminDashboardQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetAdminDashboardQueryKey();
  const queryFn = ({ signal }) => getAdminDashboard({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useGetAdminDashboard(options) {
  const queryOptions = getGetAdminDashboardQueryOptions(options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getListAdminContentUrl = (kind) => {
  return `/api/admin/content/${kind}`;
};
var listAdminContent = async (kind, options) => {
  return customFetch(
    getListAdminContentUrl(kind),
    {
      ...options,
      method: "GET"
    }
  );
};
var getListAdminContentQueryKey = (kind) => {
  return [
    `/api/admin/content/${kind}`
  ];
};
var getListAdminContentQueryOptions = (kind, options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListAdminContentQueryKey(kind);
  const queryFn = ({ signal }) => listAdminContent(kind, { signal, ...requestOptions });
  return { queryKey, queryFn, enabled: kind !== null && kind !== void 0, ...queryOptions };
};
function useListAdminContent(kind, options) {
  const queryOptions = getListAdminContentQueryOptions(kind, options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getCreateContentUrl = (kind) => {
  return `/api/admin/content/${kind}`;
};
var createContent = async (kind, contentInput, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getCreateContentUrl(kind),
    {
      ...options,
      method: "POST",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(contentInput)
    }
  );
};
var getCreateContentMutationKey = () => ["createContent"];
var getCreateContentMutationOptions = (options) => {
  const mutationKey = getCreateContentMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { kind, data } = props ?? {};
    return createContent(kind, data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useCreateContent = (options) => {
  return useMutation(getCreateContentMutationOptions(options));
};
var getUpdateContentUrl = (kind, id) => {
  return `/api/admin/content/${kind}/${id}`;
};
var updateContent = async (kind, id, contentInput, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getUpdateContentUrl(kind, id),
    {
      ...options,
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(contentInput)
    }
  );
};
var getUpdateContentMutationKey = () => ["updateContent"];
var getUpdateContentMutationOptions = (options) => {
  const mutationKey = getUpdateContentMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { kind, id, data } = props ?? {};
    return updateContent(kind, id, data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useUpdateContent = (options) => {
  return useMutation(getUpdateContentMutationOptions(options));
};
var getArchiveContentUrl = (kind, id) => {
  return `/api/admin/content/${kind}/${id}`;
};
var archiveContent = async (kind, id, options) => {
  return customFetch(
    getArchiveContentUrl(kind, id),
    {
      ...options,
      method: "DELETE"
    }
  );
};
var getArchiveContentMutationKey = () => ["archiveContent"];
var getArchiveContentMutationOptions = (options) => {
  const mutationKey = getArchiveContentMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { kind, id } = props ?? {};
    return archiveContent(kind, id, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useArchiveContent = (options) => {
  return useMutation(getArchiveContentMutationOptions(options));
};
var getListAdminLeadsUrl = () => {
  return `/api/admin/leads`;
};
var listAdminLeads = async (options) => {
  return customFetch(
    getListAdminLeadsUrl(),
    {
      ...options,
      method: "GET"
    }
  );
};
var getListAdminLeadsQueryKey = () => {
  return [
    `/api/admin/leads`
  ];
};
var getListAdminLeadsQueryOptions = (options) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListAdminLeadsQueryKey();
  const queryFn = ({ signal }) => listAdminLeads({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions };
};
function useListAdminLeads(options) {
  const queryOptions = getListAdminLeadsQueryOptions(options);
  const query = useQuery(queryOptions);
  return withQueryKey(query, queryOptions.queryKey);
}
var getUpdateLeadUrl = (id) => {
  return `/api/admin/leads/${id}`;
};
var updateLead = async (id, leadUpdate, options) => {
  const getHeaders = (h) => {
    if (!h) return {};
    if (h instanceof Headers) return Object.fromEntries(h.entries());
    if (Symbol.iterator in h) {
      return Object.fromEntries(
        Array.from(h, (entry) => Array.from(entry))
      );
    }
    const headers = {};
    for (const [name, value] of Object.entries(h)) {
      if (value !== void 0) headers[name] = value;
    }
    return headers;
  };
  return customFetch(
    getUpdateLeadUrl(id),
    {
      ...options,
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...getHeaders(options?.headers) },
      body: JSON.stringify(leadUpdate)
    }
  );
};
var getUpdateLeadMutationKey = () => ["updateLead"];
var getUpdateLeadMutationOptions = (options) => {
  const mutationKey = getUpdateLeadMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id, data } = props ?? {};
    return updateLead(id, data, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useUpdateLead = (options) => {
  return useMutation(getUpdateLeadMutationOptions(options));
};
var getDeleteLeadUrl = (id) => {
  return `/api/admin/leads/${id}`;
};
var deleteLead = async (id, options) => {
  return customFetch(
    getDeleteLeadUrl(id),
    {
      ...options,
      method: "DELETE"
    }
  );
};
var getDeleteLeadMutationKey = () => ["deleteLead"];
var getDeleteLeadMutationOptions = (options) => {
  const mutationKey = getDeleteLeadMutationKey();
  const { mutation: mutationOptions, request: requestOptions } = options ? options.mutation && "mutationKey" in options.mutation && options.mutation.mutationKey ? options : { ...options, mutation: { ...options.mutation, mutationKey } } : { mutation: { mutationKey }, request: void 0 };
  const mutationFn = (props) => {
    const { id } = props ?? {};
    return deleteLead(id, requestOptions);
  };
  return { mutationFn, ...mutationOptions };
};
var useDeleteLead = (options) => {
  return useMutation(getDeleteLeadMutationOptions(options));
};
export {
  ApiError,
  adminLogin,
  adminLogout,
  archiveContent,
  askAcadBot,
  changeAdminPassword,
  createContent,
  deleteLead,
  getAdminDashboard,
  getAdminLoginMutationKey,
  getAdminLoginMutationOptions,
  getAdminLoginUrl,
  getAdminLogoutMutationKey,
  getAdminLogoutMutationOptions,
  getAdminLogoutUrl,
  getAdminSession,
  getArchiveContentMutationKey,
  getArchiveContentMutationOptions,
  getArchiveContentUrl,
  getAskAcadBotMutationKey,
  getAskAcadBotMutationOptions,
  getAskAcadBotUrl,
  getChangeAdminPasswordMutationKey,
  getChangeAdminPasswordMutationOptions,
  getChangeAdminPasswordUrl,
  getContent,
  getCreateContentMutationKey,
  getCreateContentMutationOptions,
  getCreateContentUrl,
  getDeleteLeadMutationKey,
  getDeleteLeadMutationOptions,
  getDeleteLeadUrl,
  getDiscovery,
  getGetAdminDashboardQueryKey,
  getGetAdminDashboardQueryOptions,
  getGetAdminDashboardUrl,
  getGetAdminSessionQueryKey,
  getGetAdminSessionQueryOptions,
  getGetAdminSessionUrl,
  getGetContentQueryKey,
  getGetContentQueryOptions,
  getGetContentUrl,
  getGetDiscoveryQueryKey,
  getGetDiscoveryQueryOptions,
  getGetDiscoveryUrl,
  getGetMediaObjectQueryKey,
  getGetMediaObjectQueryOptions,
  getGetMediaObjectUrl,
  getHealthCheckQueryKey,
  getHealthCheckQueryOptions,
  getHealthCheckUrl,
  getListAdminContentQueryKey,
  getListAdminContentQueryOptions,
  getListAdminContentUrl,
  getListAdminLeadsQueryKey,
  getListAdminLeadsQueryOptions,
  getListAdminLeadsUrl,
  getListContentQueryKey,
  getListContentQueryOptions,
  getListContentUrl,
  getMediaObject,
  getRequestMediaUploadMutationKey,
  getRequestMediaUploadMutationOptions,
  getRequestMediaUploadUrl,
  getSubmitLeadMutationKey,
  getSubmitLeadMutationOptions,
  getSubmitLeadUrl,
  getUpdateContentMutationKey,
  getUpdateContentMutationOptions,
  getUpdateContentUrl,
  getUpdateLeadMutationKey,
  getUpdateLeadMutationOptions,
  getUpdateLeadUrl,
  healthCheck,
  listAdminContent,
  listAdminLeads,
  listContent,
  requestMediaUpload,
  setAuthTokenGetter,
  setBaseUrl,
  submitLead,
  updateContent,
  updateLead,
  useAdminLogin,
  useAdminLogout,
  useArchiveContent,
  useAskAcadBot,
  useChangeAdminPassword,
  useCreateContent,
  useDeleteLead,
  useGetAdminDashboard,
  useGetAdminSession,
  useGetContent,
  useGetDiscovery,
  useGetMediaObject,
  useHealthCheck,
  useListAdminContent,
  useListAdminLeads,
  useListContent,
  useRequestMediaUpload,
  useSubmitLead,
  useUpdateContent,
  useUpdateLead
};
