import * as t from "io-ts";
import * as E from "fp-ts/lib/Either";
import I18n from "../../../../i18n";
import { showToast } from "../../../../utils/showToast";
import { openWebUrl } from "../../../../utils/url";
import {
  IO_INTERNAL_LINK_PREFIX,
  IO_FIMS_LINK_PREFIX,
  IO_FIMS_LINK_PROTOCOL
} from "../../../../utils/navigation";

export const isIoInternalLink = (href: string): boolean =>
  href.startsWith(IO_INTERNAL_LINK_PREFIX);

export const isIoFIMSLink = (href: string): boolean =>
  href.startsWith(IO_FIMS_LINK_PREFIX);

export const removeFIMSPrefixFromUrl = (fimsUrlWithProtocol: string) => {
  // eslint-disable-next-line no-useless-escape
  const regexp = new RegExp(`^${IO_FIMS_LINK_PROTOCOL}\/\/`, "i");
  return fimsUrlWithProtocol.replace(regexp, "");
};

/**
 * a dedicated codec for CustomHandledLink
 * ex: iohandledlink://tel:1234567 -> {url: tel:1234567, type: tel, value:1234567}
 */

export const CustomHandledLink = t.interface({
  url: t.string,
  schema: t.keyof({
    /* handled by Linking of React Native - see https://reactnative.dev/docs/linking#built-in-url-schemes */
    http: null,
    https: null,
    sms: null,
    tel: null,
    mailto: null,
    /* custom handling by IO */
    copy: null
  }),
  value: t.string
});
export type CustomHandledLink = t.TypeOf<typeof CustomHandledLink>;
// Prefix to handle the press of a link as managed by the handleItemOnPress function.
// It should be expressed like `ioHandledLink://mailto:mario.rossi@yahoo.it` or `ioHandledLink://tel:0039000000`
export const IO_CUSTOM_HANDLED_PRESS_PREFIX = "iohandledlink://";

/**
 * recognize if the give href string is corresponding to iohandledlink
 * if yes all data will be extracted
 * @param href
 */
export const deriveCustomHandledLink = (
  href: string
): E.Either<Error, CustomHandledLink> => {
  const url = href.trim();
  if (url.toLowerCase().indexOf(IO_CUSTOM_HANDLED_PRESS_PREFIX) !== -1) {
    const cleanedLink = url.replace(
      new RegExp(IO_CUSTOM_HANDLED_PRESS_PREFIX, "ig"),
      ""
    );
    const [schema, value] = cleanedLink.split(":");
    const maybeCustomHandledLink = CustomHandledLink.decode({
      schema,
      value,
      url: cleanedLink
    });
    if (E.isRight(maybeCustomHandledLink)) {
      return E.right(maybeCustomHandledLink.right);
    }
  }
  return E.left(
    new Error(`"${href}" is not recognized as a valid handled link`)
  );
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
  const getErrorToast = () => showToast(error);
  openWebUrl(url, getErrorToast);
}
