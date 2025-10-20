import i18n from "i18next";
import { Body } from "@pagopa/io-app-design-system";
import { useSendActivationBottomSheet } from "../hooks/useSendActivationBottomSheet";
import { useSendAreYouSureBottomSheet } from "../hooks/useSendAreYouSureBottomSheet";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { WhatsNewScreenContent } from "../../../../components/screens/WhatsNewScreenContent";
import IOMarkdown from "../../../../components/IOMarkdown";
import { getTxtNodeKey } from "../../../../components/IOMarkdown/renderRules";
import { IOMarkdownRenderRules } from "../../../../components/IOMarkdown/types";

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

  useAvoidHardwareBackButton();

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
          onPress: presentActivationBottomSheet
        }}
        secondaryAction={{
          testID: "sendEngagementOnFirstAppOpenSecondaryActionID",
          label: i18n.t("features.pn.loginEngagement.send.secondaryAction"),
          onPress: presentAreYouSureBottomSheet
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
