import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ScreenCHData } from "../../../../definitions/content/ScreenCHData";
import { ContextualHelpData } from "../../../features/zendesk/screens/ZendeskSupportHelpCenter";
import { handleItemOnPress } from "../../../utils/url";
import {
  deriveCustomHandledLink,
  isIoInternalLink
} from "../../ui/Markdown/handlers/link";
import { ContextualHelpProps, ContextualHelpPropsMarkdown } from "./index";

export const handleOnLinkClicked = (hideHelp: () => void) => (url: string) => {
  // manage links with IO_INTERNAL_LINK_PREFIX as prefix
  if (isIoInternalLink(url)) {
    hideHelp();
    return;
  }

  // manage links with IO_CUSTOM_HANDLED_PRESS_PREFIX as prefix
  const customHandledLink = deriveCustomHandledLink(url);
  pipe(
    customHandledLink,
    E.map(link => handleItemOnPress(link.url)())
  );
};

/**
 * Extract a title and a body (ContextualHelpProps) if the contextualHelp or the contextualHelpMarkdown in input are defined,
 * otherwise returns undefined.
 * @param contextualHelp
 * @param contextualHelpMarkdown
 * @param onLoadEnd
 * @param onLinkClicked
 * @param shouldHandleLink
 */
export const getContextualHelpConfig = (
  contextualHelp: ContextualHelpProps | undefined,
  contextualHelpMarkdown: ContextualHelpPropsMarkdown | undefined
): ContextualHelpProps | undefined =>
  contextualHelp
    ? { body: contextualHelp.body, title: contextualHelp.title }
    : contextualHelpMarkdown
    ? {
        body: I18n.t(contextualHelpMarkdown.body as any),
        title: I18n.t(contextualHelpMarkdown.title as any)
      }
    : undefined;

/**
 If contextualData (loaded from the content server) contains the route of the current screen,
 title, content, faqs are read from it, otherwise they came from the locales stored in app
 */
export const getContextualHelpData = (
  maybeContextualData: O.Option<ScreenCHData>,
  defaultData: ContextualHelpData
): ContextualHelpData =>
  pipe(
    maybeContextualData,
    O.fold(
      () => defaultData,
      data => ({
        title: data.title,
        content: data.content,
        faqs: pipe(
          data.faqs,
          O.fromNullable,
          O
            // ensure the array is defined and not empty
            .chainNullableK(faqs => (faqs.length > 0 ? faqs : undefined)),
          O
            // if remote faqs are not defined or empty, fallback to the local ones
            .fold(
              () => defaultData.faqs,
              fqs => fqs.map(f => ({ title: f.title, content: f.body }))
            )
        )
      })
    )
  );

export const reloadContextualHelpDataThreshold = (30 * 1000) as Millisecond;
