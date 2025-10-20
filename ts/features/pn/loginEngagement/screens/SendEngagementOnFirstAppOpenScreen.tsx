import i18n from "i18next";
import { Body } from "@pagopa/io-app-design-system";
import { useEffect } from "react";
import { useSendActivationBottomSheet } from "../hooks/useSendActivationBottomSheet";
import { useSendAreYouSureBottomSheet } from "../hooks/useSendAreYouSureBottomSheet";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { IOMarkdownRenderRules } from "../../../../components/IOMarkdown/types";
import {
  trackSendAcceptanceDialog,
  trackSendActivationModalDialog,
  trackSendActivationModalDialogActivationDismissed,
  trackSendActivationModalDialogActivationStart,
  trackSendNurturingDialog
} from "../../analytics/send";
import { NotificationModalFlow } from "../../../pushNotifications/analytics";

export const flow: NotificationModalFlow = "access";

const customRules: Partial<IOMarkdownRenderRules> = {
  Paragraph: (param, render) => (
    <Body style={{ textAlign: "center" }} key={getTxtNodeKey(param)}>
      {param.children.map(render)}
    </Body>
  )
};

export const SendEngagementOnFirstAppOpenScreen = () => {
  const { activationBottomSheet, presentActivationBottomSheet } =
    useSendActivationBottomSheet();
  const { areYouSureBottomSheet, presentAreYouSureBottomSheet } =
    useSendAreYouSureBottomSheet();

  useEffect(() => {
    void trackSendActivationModalDialog(flow);
  }, []);

  useAvoidHardwareBackButton();

  const trackAndPresentActivationBottomSheet = () => {
    trackSendActivationModalDialogActivationStart(flow);
    presentActivationBottomSheet();
    trackSendAcceptanceDialog(flow);
  };

  const trackAndPresentAreYouSureBottomSheet = () => {
    trackSendActivationModalDialogActivationDismissed(flow);
    presentAreYouSureBottomSheet();
    trackSendNurturingDialog(flow);
  };

  return (
    <>
      <WhatsNewScreenContent
        pictogram="savingMoney"
        title={i18n.t("features.pn.loginEngagement.send.title")}
        badge={{
          text: i18n.t("features.pn.loginEngagement.send.topElement.label"),
          variant: "highlight"
        }}
        action={{
          testID: "sendEngagementOnFirstAppOpenActionID",
          label: i18n.t("features.pn.loginEngagement.send.action"),
          fullWidth: true,
          onPress: trackAndPresentActivationBottomSheet
        }}
        secondaryAction={{
          testID: "sendEngagementOnFirstAppOpenSecondaryActionID",
          label: i18n.t("features.pn.loginEngagement.send.secondaryAction"),
          onPress: trackAndPresentAreYouSureBottomSheet
        }}
      >
        <IOMarkdown
          rules={customRules}
          content={i18n.t("features.pn.loginEngagement.send.description")}
        />
      </WhatsNewScreenContent>
      {activationBottomSheet}
      {areYouSureBottomSheet}
    </>
  );
};
