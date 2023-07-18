import CookieManager, { Cookie } from "@react-native-cookies/cookies";

export const clearAllCookie = (cb: () => void) =>
  void CookieManager.clearAll().catch(cb);

export const removeSessionCoookies = (cb?: () => void) =>
  void CookieManager.removeSessionCookies().catch(_ => cb?.());

export const setCookie = (
  origin: string,
  cookie: Cookie,
  onSuccess: () => void,
  onError: () => void
) =>
  void CookieManager.set(origin, cookie, true).then(onSuccess).catch(onError);
