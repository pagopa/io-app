import {
  Body,
  ContentWrapper,
  ListItemAction,
  ListItemHeader,
  ListItemInfoCopy,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { useSendAarFlowManager } from "../../hooks/useSendAarFlowManager";
import { isAarErrorState } from "../../utils/stateUtils";

export const SendAARErrorComponent = () => {
  const { terminateFlow, currentFlowData } = useSendAarFlowManager();

  const errorCodes = useMemo(
    () => (isAarErrorState(currentFlowData) ? currentFlowData.errorCodes : []),
    [currentFlowData]
  );

  const {
    bottomSheet,
    present: presentModal,
    dismiss
  } = useIOBottomSheetModal({
    component: (
      <>
        <Body>{I18n.t("features.pn.aar.flow.ko.GENERIC.detail.subTitle")}</Body>
        <VSpacer size={16} />
        <ListItemHeader
          label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.supportTitle")}
        />
        <ListItemAction
          label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.chat")}
          accessibilityLabel={I18n.t(
            "features.pn.aar.flow.ko.GENERIC.detail.chat"
          )}
          onPress={() => {
            dismiss();
            // zendeskAssistanceLogAndStart();
          }}
          variant="primary"
          icon="chat"
        />
        <VSpacer size={24} />
        <ListItemHeader
          label={I18n.t(
            "features.pn.aar.flow.ko.GENERIC.detail.additionalDataTitle"
          )}
        />
        <ListItemInfoCopy
          label={I18n.t("features.pn.aar.flow.ko.GENERIC.detail.errorCode")}
          accessibilityLabel={I18n.t(
            "features.pn.aar.flow.ko.GENERIC.detail.errorCode"
          )}
          icon="ladybug"
          value={errorCodes.join("\n")}
          numberOfLines={errorCodes.length}
          onPress={() => clipboardSetStringWithFeedback(errorCodes.join(", "))}
        />
        <VSpacer size={24} />
      </>
    ),
    title: ""
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        scrollEnabled={false}
        contentContainerStyle={styles.scrollViewContentContainer}
      >
        <ContentWrapper>
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
              onPress: presentModal,
              testID: "secondary_button"
            }}
          />
        </ContentWrapper>
      </ScrollView>
      {bottomSheet}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContentContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexGrow: 1
  }
});
