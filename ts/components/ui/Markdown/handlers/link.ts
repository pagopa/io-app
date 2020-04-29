import I18n from "i18n-js";
import { Linking } from "react-native";
import { Dispatch } from "../../../../store/actions/types";
import { showToast } from "../../../../utils/showToast";
import { handleInternalLink, IO_INTERNAL_LINK_PREFIX } from "./internalLink";

export const isIoInternalLink = (href: string): boolean =>
  href.startsWith(IO_INTERNAL_LINK_PREFIX);

/**
 * Handles links clicked in the Markdown (webview) component.
 * Internal links handling is demanded to the `handleInternalLink` function.
 */
export function handleLinkMessage(dispatch: Dispatch, href: string) {
  if (isIoInternalLink(href)) {
    handleInternalLink(dispatch, href);
  } else {
    // External urls must be opened with the OS browser.
    // FIXME: Whitelist allowed domains: https://www.pivotaltracker.com/story/show/158470128
    Linking.openURL(href).catch(() => 0);
  }
}

// remove protocol from a link ex: http://www.site.com -> www.site.com
export const removeProtocol = (link: string): string => {
  return link.replace(new RegExp(/https?:\/\//gi), "");
};

export function openLink(url: string, customError?: string) {
  const error = customError || I18n.t("global.genericError");
  const getErrorToast = () => showToast(error);

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url).catch(getErrorToast);
      } else {
        showToast(I18n.t("global.genericError"));
      }
    })
    .catch(getErrorToast);
}
