import { Body } from "@pagopa/io-app-design-system";
import i18n from "i18next";
import { useEffect } from "react";

import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { IOMarkdownRenderRules } from "../../../../components/IOMarkdown/types";
import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { NotificationModalFlow } from "../../../pushNotifications/analytics";
import {
  trackSendAcceptanceDialog,
  trackSendActivationModalDialog,
  trackSendActivationModalDialogActivationDismissed,
  trackSendActivationModalDialogActivationStart,
  trackSendNurturingDialog
} from "../../analytics/send";
import { useSendActivationBottomSheet } from "../hooks/useSendActivationBottomSheet";
import { useSendAreYouSureBottomSheet } from "../hooks/useSendAreYouSureBottomSheet";

const flow: NotificationModalFlow = "access";

const customRules: Partial<IOMarkdownRenderRules> = {
  Paragraph: (param, render) => (
    <Body key={getTxtNodeKey(param)} style={{ textAlign: "center" }}>
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
        action={{
          testID: "sendEngagementOnFirstAppOpenActionID",
          label: i18n.t("features.pn.loginEngagement.send.action"),
          fullWidth: true,
          onPress: trackAndPresentActivationBottomSheet
        }}
        badge={{
          text: i18n.t("features.pn.loginEngagement.send.topElement.label"),
          variant: "highlight"
        }}
        pictogram="savingMoney"
        secondaryAction={{
          testID: "sendEngagementOnFirstAppOpenSecondaryActionID",
          label: i18n.t("features.pn.loginEngagement.send.secondaryAction"),
          onPress: trackAndPresentAreYouSureBottomSheet
        }}
        title={i18n.t("features.pn.loginEngagement.send.title")}
      >
        <IOMarkdown
          content={i18n.t("features.pn.loginEngagement.send.description")}
          rules={customRules}
        />
      </WhatsNewScreenContent>
      {activationBottomSheet}
      {areYouSureBottomSheet}
    </>
  );
};
