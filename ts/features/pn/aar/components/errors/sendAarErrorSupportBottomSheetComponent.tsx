import {
  Body,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { trackSendAarErrorScreenDetailsCode } from "../../analytics";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

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
      label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.chat")}
      accessibilityLabel={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.chat")}
      onPress={onAssistancePress}
      variant="primary"
      icon="chat"
      testID="button_assistance"
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
          label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.errorCode")}
          accessibilityLabel={I18n.t(
            "features.pn.aar.flow.ko.GENERIC.detail.errorCode"
          )}
          icon="ladybug"
          value={assistanceErrorCode}
          numberOfLines={2}
          onPress={() => {
            trackSendAarErrorScreenDetailsCode();
            onCopyToClipboardPress?.();
            clipboardSetStringWithFeedback(assistanceErrorCode);
          }}
          testID="error_code_value"
        />
        <VSpacer size={24} />
      </>
    )}
  </>
);
