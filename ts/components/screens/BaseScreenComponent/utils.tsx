import { BugReporting } from "instabug-reactnative";

import { fromNullable, Option } from "fp-ts/lib/Option";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import React from "react";
import {
  DefaultReportAttachmentTypeConfiguration,
  TypeLogs,
  instabugLog,
  openInstabugQuestionReport,
  openInstabugReplies,
  setInstabugDeviceIdAttribute,
  setInstabugSupportTokenAttribute
} from "../../../boot/configureInstabug";
import { handleItemOnPress } from "../../../utils/url";
import {
  deriveCustomHandledLink,
  isIoInternalLink
} from "../../ui/Markdown/handlers/link";
import { getValueOrElse } from "../../../features/bonus/bpd/model/RemoteValue";
import { RequestAssistancePayload } from "../../ContextualHelp";
import { ScreenCHData } from "../../../../definitions/content/ScreenCHData";
import { ContextualHelpData } from "../../ContextualHelp/ContextualHelpComponent";
import Markdown from "../../ui/Markdown";
import I18n from "../../../i18n";
import { ContextualHelpProps, ContextualHelpPropsMarkdown } from "./index";

/**
 * Run side-effects from the Instabug library based on the type of support.
 */
export function handleOnContextualHelpDismissed(
  payload: RequestAssistancePayload,
  attachmentConfig: DefaultReportAttachmentTypeConfiguration
): void {
  const maybeSupportToken = getValueOrElse(payload.supportToken, undefined);
  const { supportType } = payload;

  switch (supportType) {
    case BugReporting.reportType.bug: {
      // Store/remove and log the support token only if is a new assistance request.
      // log on instabug the support token
      if (maybeSupportToken) {
        instabugLog(
          JSON.stringify(maybeSupportToken),
          TypeLogs.INFO,
          "support-token"
        );
      }
      // set or remove the properties
      setInstabugSupportTokenAttribute(maybeSupportToken);
      setInstabugDeviceIdAttribute(payload.deviceUniqueId);

      openInstabugQuestionReport(attachmentConfig);
      return;
    }

    case BugReporting.reportType.question: {
      openInstabugReplies();
      return;
    }

    default:
      return;
  }
}

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

export const getContextualHelpConfig = (
  contextualHelp: ContextualHelpProps | undefined,
  contextualHelpMarkdown: ContextualHelpPropsMarkdown | undefined,
  onLoadEnd: () => void,
  onLinkClicked: (url: string) => void
): ContextualHelpProps | undefined =>
  contextualHelp
    ? { body: contextualHelp.body, title: contextualHelp.title }
    : contextualHelpMarkdown
    ? {
        body: () => (
          <Markdown onLinkClicked={onLinkClicked} onLoadEnd={onLoadEnd}>
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
