import CookieManager, { Cookie } from "@react-native-cookies/cookies";

export const ioClearCookie = (cb: () => void) => {
  CookieManager.clearAll().catch(cb);
};

export const setCookie = (
  origin: string,
  cookie: Cookie,
  onSuccess: () => void,
  onError: () => void
) => {
  CookieManager.set(origin, cookie, true).then(onSuccess).catch(onError);
};
