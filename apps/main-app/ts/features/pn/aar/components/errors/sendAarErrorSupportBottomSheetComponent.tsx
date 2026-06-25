import {
  Body,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";

import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { trackSendAarErrorScreenDetailsCode } from "../../analytics";

export const sendAarErrorSupportBottomSheetComponent = (
  onAssistancePress: () => void,
  assistanceErrorCode?: string,
  onCopyToClipboardPress?: () => void
) => (
  <>
    <Body>{I18n.t("features.pn.aar.flow.ko.GENERIC.detail.subTitle")}</Body>
    <VSpacer size={16} />
    <ListItemHeader
      label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.supportTitle")}
    />
    <ListItemAction
      accessibilityLabel={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.chat")}
      icon="chat"
      label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.chat")}
      onPress={onAssistancePress}
      testID="button_assistance"
      variant="primary"
    />
    <VSpacer size={24} />
    {assistanceErrorCode && (
      <>
        <ListItemHeader
          label={I18n.t(
            "features.pn.aar.flow.ko.GENERIC.detail.additionalDataTitle"
          )}
          testID="error_code_section_header"
        />
        <ListItemInfoCopy
          accessibilityLabel={I18n.t(
            "features.pn.aar.flow.ko.GENERIC.detail.errorCodeAccessibility",
            { errorCode: assistanceErrorCode }
          )}
          icon="ladybug"
          label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.errorCode")}
          numberOfLines={2}
          onPress={() => {
            trackSendAarErrorScreenDetailsCode();
            onCopyToClipboardPress?.();
            clipboardSetStringWithFeedback(assistanceErrorCode);
          }}
          testID="error_code_value"
          value={assistanceErrorCode}
        />
        <VSpacer size={24} />
      </>
    )}
  </>
);
