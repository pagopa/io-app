import { IOToast } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { IO_INTERNAL_LINK_PREFIX } from "../../../../utils/navigation";
import { openWebUrl } from "../../../../utils/url";

export const isIoInternalLink = (href: string): boolean =>
  href.toLowerCase().startsWith(IO_INTERNAL_LINK_PREFIX);

export const isHttpsLink = (href: string): boolean =>
  href.toLowerCase().startsWith("https://");
export const isHttpLink = (href: string): boolean =>
  href.toLowerCase().startsWith("http://");

/**
 * URL schemas supported by CustomHandledLink.
 * `http`/`https`/`sms`/`tel`/`mailto` are handled by React Native's Linking
 * (see https://reactnative.dev/docs/linking#built-in-url-schemes);
 * `copy` is handled internally by IO.
 */
const CUSTOM_LINK_SCHEMAS_REGEX = new RegExp(
  `^(http|https|sms|tel|mailto|copy)$`,
  "i"
);

// Prefix to handle the press of a link as managed by the handleItemOnPress function.
// It should be expressed like `ioHandledLink://mailto:mario.rossi@yahoo.it` or `ioHandledLink://tel:0039000000`
export const IO_CUSTOM_HANDLED_PRESS_PREFIX = "iohandledlink://";

/**
 * Parses an `iohandledlink://` href and returns the structured link data
 * or `undefined` if the href is not a valid handled link.
 */
export const deriveCustomHandledLink = (href: string) => {
  const url = href.trim();
  const hasPrefix = url.toLowerCase().includes(IO_CUSTOM_HANDLED_PRESS_PREFIX);

  if (!hasPrefix) {
    return undefined;
  }
  const cleanedLink = url.replace(
    new RegExp(IO_CUSTOM_HANDLED_PRESS_PREFIX, "ig"),
    ""
  );

  const [schema, value] = cleanedLink.split(":");
  const isValidSchema = CUSTOM_LINK_SCHEMAS_REGEX.test(schema);

  if (value == null || isValidSchema === false) {
    return undefined;
  }
  return { schema, value, url: cleanedLink };
};

/**
 * Handles links clicked in the Markdown (webview) component.
 */
export function handleLinkMessage(href: string) {
  if (isIoInternalLink(href)) {
    return;
  } else {
    // External urls must be opened with the OS browser.
    // FIXME: Whitelist allowed domains: https://www.pivotaltracker.com/story/show/158470128
    openWebUrl(href);
  }
}

// try to open the given url. If it fails an error toast will shown
export function openLink(url: string, customError?: string) {
  const error = customError || I18n.t("global.genericError");
  const getErrorToast = () => IOToast.error(error);
  openWebUrl(url, getErrorToast);
}
