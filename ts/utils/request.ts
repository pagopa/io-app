import { Omit } from "italia-ts-commons/lib/types";

// withBearerToken injects the field 'Baerer' with value token into the parameter P
// of the f function
export const withBearerToken = <P extends { Bearer: string }, R>(
  token: string,
  f: (p: P) => Promise<R>
) => async (po: Omit<P, "Bearer">): Promise<R> => {
  const params = Object.assign({ Bearer: String(token) }, po) as P;
  return f(params);
};
