import { Badge, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { useAARPushEngagementScreenLogic } from "../hooks/useAARpushEngagementScreenLogic";

export const SendQrScanPushEngagementScreen = () => {
  const { shouldRenderBlankPage, onButtonPress } =
    useAARPushEngagementScreenLogic();

  if (shouldRenderBlankPage) {
    return <></>;
  }

  return (
    <OperationResultScreenContent
      isHeaderVisible
      pictogram="notification"
      title={I18n.t("features.pn.aar.pushEngagement.title")}
      subtitle={I18n.t("features.pn.aar.pushEngagement.body")}
      topElement={<TopElement />}
      action={{
        label: I18n.t("features.pn.aar.pushEngagement.cta"),
        onPress: onButtonPress,
        testID: "engagement-cta"
      }}
    />
  );
};

const TopElement = () => (
  <View style={{ alignItems: "center" }}>
    <Badge
      variant="highlight"
      text={I18n.t("features.pn.aar.pushEngagement.badge")}
    />
    <VSpacer size={8} />
  </View>
);
