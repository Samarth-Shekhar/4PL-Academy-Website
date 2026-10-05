import {
  useListContent, getListContentQueryKey, useGetContent, getGetContentQueryKey,
  useGetAdminSession, getGetAdminSessionQueryKey,
} from '@workspace/api-client-react';

const clean = (p) => {
  if (!p) return undefined;
  const o = {};
  Object.entries(p).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') o[k] = v; });
  return Object.keys(o).length ? o : undefined;
};
export function usePublicList(kind, params, extra = {}) {
  const p = clean(params);
  return useListContent(kind, p, { query: { queryKey: getListContentQueryKey(kind, p), staleTime: 30000, refetchOnMount: true, ...extra } });
}
export function usePublicItem(kind, slug, extra = {}) {
  return useGetContent(kind, slug, { query: { queryKey: getGetContentQueryKey(kind, slug), staleTime: 30000, refetchOnMount: true, retry: false, enabled: !!slug, ...extra } });
}
export function useAdminSession() {
  return useGetAdminSession({ query: { queryKey: getGetAdminSessionQueryKey(), staleTime: 30000, refetchOnMount: true, retry: false } });
}
export const invalidateAll = (qc) =>
  qc.invalidateQueries({
    predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/') && !q.queryKey[0].includes('/admin/session'),
  });
export const errMsg = (e) => e?.data?.message || e?.data?.error || e?.message || 'Something went wrong. Please try again.';
