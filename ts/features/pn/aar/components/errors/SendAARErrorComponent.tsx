import {
  Body,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { isTestEnv } from "../../../../../utils/environment";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import { currentAARFlowStateErrorCodes } from "../../store/reducers";

const bottomComponent = (errorCodes: ReadonlyArray<string>) => (
  <>
    <Body>{I18n.t("features.pn.aar.flow.ko.GENERIC.detail.subTitle")}</Body>
    <VSpacer size={16} />
    <ListItemHeader
      label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.supportTitle")}
    />
    <ListItemAction
      label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.chat")}
      accessibilityLabel={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.chat")}
      onPress={() => undefined}
      variant="primary"
      icon="chat"
    />
    <VSpacer size={24} />
    {!!errorCodes.length && (
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
          value={errorCodes.join(", ")}
          numberOfLines={1}
          onPress={() => clipboardSetStringWithFeedback(errorCodes.join(", "))}
          testID="error_code_value"
        />
        <VSpacer size={24} />
      </>
    )}
  </>
);

export const SendAARErrorComponent = () => {
  const { terminateFlow } = useSendAarFlowManager();
  const errorCodes = useIOSelector(currentAARFlowStateErrorCodes);

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: bottomComponent(errorCodes),
    title: ""
  });

  return (
    <>
      <OperationResultScreenContent
        testID="SEND_AAR_ERROR"
        isHeaderVisible
        pictogram="umbrella"
        title={I18n.t("features.pn.aar.flow.ko.GENERIC.title")}
        subtitle={I18n.t("features.pn.aar.flow.ko.GENERIC.body")}
        action={{
          label: I18n.t("features.pn.aar.flow.ko.GENERIC.primaryAction"),
          onPress: terminateFlow,
          testID: "primary_button"
        }}
        secondaryAction={{
          label: I18n.t("features.pn.aar.flow.ko.GENERIC.secondaryAction"),
          onPress: present,
          testID: "secondary_button"
        }}
      />
      {bottomSheet}
    </>
  );
};

export const testable = isTestEnv ? { bottomComponent } : undefined;
