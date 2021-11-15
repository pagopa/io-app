import { BugReporting } from "instabug-reactnative";

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
