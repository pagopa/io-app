import { Option, some } from "fp-ts/lib/Option";
import { Linking } from "react-native";
import I18n from "../../../../i18n";
import { Dispatch } from "../../../../store/actions/types";
import { showToast } from "../../../../utils/showToast";
import { safeOpenUrl } from "../../../../utils/url";
import { handleInternalLink, IO_INTERNAL_LINK_PREFIX } from "./internalLink";

export const isIoInternalLink = (href: string): boolean =>
  href.startsWith(IO_INTERNAL_LINK_PREFIX);

// Prefix to handle the press of a link as managed by the handleItemOnPress function.
// It should be expressed like `ioHandledLink://emailto:mario.rossi@yahoo.it` or `ioHandledLink://call:0039000000`
export const IO_CUSTOM_HANDLED_PRESS_PREFIX = "iohandledlink://";
export const deriveCustomHandledLink = (href: string): Option<string> =>
  some(href.toLowerCase().trim())
    .filter(s => s.indexOf(IO_CUSTOM_HANDLED_PRESS_PREFIX) !== -1)
    .map(s => s.replace(IO_CUSTOM_HANDLED_PRESS_PREFIX, ""));

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
    safeOpenUrl(href);
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
