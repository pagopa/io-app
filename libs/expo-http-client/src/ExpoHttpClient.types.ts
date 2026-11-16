export type HttpBaseConfig = {
  followRedirects?: boolean;
  headers?: Record<string, string>;
  requestId?: string;
  timeoutMilliseconds?: number;
  url: string;
};
export type HttpCallConfig = HttpGetConfig | HttpPostConfig;
export type HttpClientFailureResponse = {
  code: number;
  headers: Record<string, string | undefined>;
  message: string;
  type: "failure";
};
export type HttpClientResponse =
  | HttpClientFailureResponse
  | HttpClientSuccessResponse;

export type HttpClientSuccessResponse = {
  body: string;
  headers: Record<string, string | undefined>;
  status: number;
  type: "success";
};
export type HttpGetConfig = HttpBaseConfig & { verb: "get" };
export type HttpPostConfig = HttpBaseConfig & {
  body?: Record<string, string>;
  verb: "post";
};
