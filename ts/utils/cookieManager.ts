import CookieManager, { Cookie } from "@react-native-cookies/cookies";

export const ioClearCookie = (cb: () => void) =>
  void CookieManager.clearAll().catch(cb);

export const clearCookie = (url: string, name: string, cb?: () => void) =>
  void CookieManager.clearByName(url, name).catch(_ => cb?.());

export const setCookie = (
  origin: string,
  cookie: Cookie,
  onSuccess: () => void,
  onError: () => void
) =>
  void CookieManager.set(origin, cookie, true).then(onSuccess).catch(onError);
