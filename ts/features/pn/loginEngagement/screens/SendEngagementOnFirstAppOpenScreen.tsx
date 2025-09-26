import { Badge } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import i18next from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useSendActivationBottomSheet } from "../hooks/useSendActivationBottomSheet";
import { useSendAreYouSureBottomSheet } from "../hooks/useSendAreYouSureBottomSheet";

export const SendEngagementOnFirstAppOpenScreen = () => {
  const { activationBottomSheet, presentActivationBottomSheet } =
    useSendActivationBottomSheet();
  const { areYouSureBottomSheet, presentAreYouSureBottomSheet } =
    useSendAreYouSureBottomSheet();

  return (
    <>
      <OperationResultScreenContent
        pictogram="savingMoney"
        topElement={
          <View style={{ alignItems: "center" }}>
            <Badge
              text={i18next.t(
                "features.pn.loginEngagement.send.topElement.label"
              )}
              variant="highlight"
            />
          </View>
        }
        title={i18next.t("features.pn.loginEngagement.send.title")}
        subtitle={[
          {
            text: i18next.t(
              "features.pn.loginEngagement.send.subtitle.firstPart"
            )
          },
          {
            text: i18next.t(
              "features.pn.loginEngagement.send.subtitle.secondPart"
            ),
            weight: "Semibold"
          }
        ]}
        action={{
          testID: "sendEngagementOnFirstAppOpenActionID",
          label: i18next.t("features.pn.loginEngagement.send.action"),
          fullWidth: true,
          onPress: presentActivationBottomSheet
        }}
        secondaryAction={{
          testID: "sendEngagementOnFirstAppOpenSecondaryActionID",
          label: i18next.t("features.pn.loginEngagement.send.secondaryAction"),
          onPress: presentAreYouSureBottomSheet
        }}
      />
      {activationBottomSheet}
      {areYouSureBottomSheet}
    </>
  );
};
