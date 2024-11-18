import Config from "react-native-config";
import { store } from "./boot/configureStoreAndPersistor";
import { sessionTokenSelector } from "./store/reducers/authentication";

export type RequestConfig<TData = unknown> = {
  baseURL?: string;
  url?: string;
  method: "GET" | "PUT" | "PATCH" | "POST" | "DELETE";
  params?: object;
  data?: TData | FormData;
  responseType?:
    | "arraybuffer"
    | "blob"
    | "document"
    | "json"
    | "text"
    | "stream";
  signal?: AbortSignal;
  headers?: HeadersInit;
};

export type ResponseConfig<TData = unknown> = {
  data: TData;
  status: number;
  statusText: string;
};

export async function fetchClient<
  TData,
  TError = unknown,
  TVariables = unknown
>(config: RequestConfig<TVariables>): Promise<ResponseConfig<TData>> {
  const response = await (global as any).fetch(
    `${Config.API_URL_PREFIX}${config.baseURL}${config.url}`,
    {
      method: config.method.toUpperCase(),
      body: JSON.stringify(config.data),
      signal: config.signal,
      headers: {
        Authorization: `Bearer ${sessionTokenSelector(store.getState())}`,
        ...config.headers
      }
    }
  );
  const data = await response.json();
  void null as TError;
  return {
    data,
    status: response.status,
    statusText: response.statusText
  };
}

export default fetchClient;
