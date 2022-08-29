import { fromNullable, Option } from "fp-ts/lib/Option";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React from "react";
import { handleItemOnPress } from "../../../utils/url";
import {
  deriveCustomHandledLink,
  isIoInternalLink
} from "../../ui/Markdown/handlers/link";
import { ScreenCHData } from "../../../../definitions/content/ScreenCHData";
import Markdown from "../../ui/Markdown";
import I18n from "../../../i18n";
import { ContextualHelpData } from "../../../features/zendesk/screens/ZendeskSupportHelpCenter";
import { ContextualHelpProps, ContextualHelpPropsMarkdown } from "./index";

export const handleOnLinkClicked = (hideHelp: () => void) => (url: string) => {
  // manage links with IO_INTERNAL_LINK_PREFIX as prefix
  if (isIoInternalLink(url)) {
    hideHelp();
    return;
  }

  // manage links with IO_CUSTOM_HANDLED_PRESS_PREFIX as prefix
  const customHandledLink = deriveCustomHandledLink(url);
  customHandledLink.map(link => handleItemOnPress(link.url)());
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
  contextualHelpMarkdown: ContextualHelpPropsMarkdown | undefined,
  onLoadEnd: () => void,
  onLinkClicked: (url: string) => void,
  shouldHandleLink?: (url: string) => boolean
): ContextualHelpProps | undefined =>
  contextualHelp
    ? { body: contextualHelp.body, title: contextualHelp.title }
    : contextualHelpMarkdown
    ? {
        body: () => (
          <Markdown
            onLinkClicked={onLinkClicked}
            onLoadEnd={onLoadEnd}
            shouldHandleLink={shouldHandleLink}
          >
            {I18n.t(contextualHelpMarkdown.body)}
          </Markdown>
        ),
        title: I18n.t(contextualHelpMarkdown.title)
      }
    : undefined;

/**
 If contextualData (loaded from the content server) contains the route of the current screen,
 title, content, faqs are read from it, otherwise they came from the locales stored in app
 */
export const getContextualHelpData = (
  maybeContextualData: Option<ScreenCHData>,
  defaultData: ContextualHelpData,
  onReady: () => void
): ContextualHelpData =>
  maybeContextualData.fold<ContextualHelpData>(defaultData, data => ({
    title: data.title,
    content: <Markdown onLoadEnd={onReady}>{data.content}</Markdown>,
    faqs: fromNullable(data.faqs)
      // ensure the array is defined and not empty
      .mapNullable(faqs => (faqs.length > 0 ? faqs : undefined))
      // if remote faqs are not defined or empty, fallback to the local ones
      .fold(defaultData.faqs, fqs =>
        fqs.map(f => ({ title: f.title, content: f.body }))
      )
  }));

export const reloadContextualHelpDataThreshold = (30 * 1000) as Millisecond;
