import {
  Body,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { isTestEnv } from "../../../../../utils/environment";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import {
  addTicketCustomField,
  appendLog,
  resetCustomFields,
  resetLog,
  zendeskCategoryId,
  zendeskSendCategory
} from "../../../../../utils/supportAssistance";
import {
  zendeskSelectedCategory,
  zendeskSupportStart
} from "../../../../zendesk/store/actions";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import {
  currentAARFlowStateAssistanceErrorCode,
  currentAARFlowStateErrorDebugInfoSelector
} from "../../store/selectors";
import { useDebugInfo } from "../../../../../hooks/useDebugInfo";
import {
  trackSendAarErrorScreenClosure,
  trackSendAarErrorScreenDetails,
  trackSendAarErrorScreenDetailsCode,
  trackSendAarErrorScreenDetailsHelp
} from "../../analytics";

const bottomComponent = (
  onAssistancePress: () => void,
  assistanceErrorCode?: string
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
            clipboardSetStringWithFeedback(assistanceErrorCode);
          }}
          testID="error_code_value"
        />
        <VSpacer size={24} />
      </>
    )}
  </>
);

export const SendAARErrorComponent = () => {
  const dispatch = useIODispatch();
  const { terminateFlow } = useSendAarFlowManager();
  const assistanceErrorCode = useIOSelector(
    currentAARFlowStateAssistanceErrorCode
  );

  const zendeskAssistanceLogAndStart = () => {
    trackSendAarErrorScreenDetailsHelp();

    dismiss();
    resetCustomFields();
    resetLog();

    addTicketCustomField(zendeskCategoryId, zendeskSendCategory.value);
    addTicketCustomField("39752564743313", "io_problema_notifica_send_qr");
    if (assistanceErrorCode != null && assistanceErrorCode.trim().length > 0) {
      appendLog(assistanceErrorCode);
    }

    dispatch(
      zendeskSupportStart({
        startingRoute: "n/a",
        assistanceType: {
          send: true
        }
      })
    );
    dispatch(zendeskSelectedCategory(zendeskSendCategory));
  };

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal({
    component: bottomComponent(
      zendeskAssistanceLogAndStart,
      assistanceErrorCode
    ),
    title: ""
  });

  const debugInfo = useIOSelector(currentAARFlowStateErrorDebugInfoSelector);
  useDebugInfo(debugInfo);

  return (
    <>
      <OperationResultScreenContent
        enableAnimatedPictogram
        testID="SEND_AAR_ERROR"
        isHeaderVisible
        pictogram="umbrella"
        title={I18n.t("features.pn.aar.flow.ko.GENERIC.title")}
        subtitle={I18n.t("features.pn.aar.flow.ko.GENERIC.body")}
        action={{
          label: I18n.t("features.pn.aar.flow.ko.GENERIC.primaryAction"),
          onPress: () => {
            trackSendAarErrorScreenClosure();
            terminateFlow();
          },
          testID: "primary_button"
        }}
        secondaryAction={{
          label: I18n.t("features.pn.aar.flow.ko.GENERIC.secondaryAction"),
          onPress: () => {
            trackSendAarErrorScreenDetails();
            present();
          },
          testID: "secondary_button"
        }}
      />
      {bottomSheet}
    </>
  );
};

export const testable = isTestEnv ? { bottomComponent } : undefined;
