let baseUrl = '';
let authTokenGetter = null;
export const setBaseUrl = value => { baseUrl = value || ''; };
export const setAuthTokenGetter = value => { authTokenGetter = value; };
export class ApiError extends Error {
  constructor(response, data) {
    super(data?.error || data?.message || `Request failed (${response.status}).`);
    this.name='ApiError';
    this.status=response.status;
    this.statusText=response.statusText;
    this.data=data;
    this.headers=response.headers;
  }
}
export async function customFetch(input, options = {}) {
  const {responseType='auto',...init}=options;
  const headers=new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
  if(authTokenGetter && !headers.has('Authorization')) {
    const token=await authTokenGetter();
    if(token)headers.set('Authorization',`Bearer ${token}`);
  }
  const url=baseUrl && typeof input==='string' && input.startsWith('/') ? baseUrl.replace(/\/$/,'')+input : input;
  const response=await fetch(url,{...init,headers,credentials:'same-origin'});
  let data=null;
  if(response.status!==204) {
    const text=await response.text();
    if(text) {
      if(responseType==='json' || response.headers.get('content-type')?.includes('json')) {
        try {data=JSON.parse(text);} catch {throw new Error('The server returned an invalid response.');}
      } else data=text;
    }
  }
  if(!response.ok)throw new ApiError(response,data);
  return data;
}
