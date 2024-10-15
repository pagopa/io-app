import React from "react";
import {
  Banner,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Linking, View, StyleSheet } from "react-native";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { trialStatusSelector } from "../../../trialSystem/store/reducers";
import { itwTrialId } from "../../../../config";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";
import { isItwEnabledSelector } from "../../../../store/reducers/backendStatus";

type ItwUpcomingWalletBannerProps = {
  ignoreMargins?: boolean;
};

export const ItwUpcomingWalletBanner = ({
  ignoreMargins = false
}: ItwUpcomingWalletBannerProps) => {
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const itwTrialStatus = useIOSelector(trialStatusSelector(itwTrialId));

  const showBanner =
    isItwEnabled &&
    itwTrialStatus !== SubscriptionStateEnum.ACTIVE &&
    itwTrialStatus !== SubscriptionStateEnum.DISABLED;

  if (!showBanner) {
    return null;
  }

  return (
    <View style={!ignoreMargins && styles.margins}>
      <Banner
        testID="itwUpcomingWalletBannerTestID"
        color="neutral"
        size="big"
        pictogramName="notification"
        title={I18n.t("features.itWallet.discovery.upcomingWalletBanner.title")}
        content={I18n.t(
          "features.itWallet.discovery.upcomingWalletBanner.content"
        )}
        action={I18n.t(
          "features.itWallet.discovery.upcomingWalletBanner.action"
        )}
        onPress={() => Linking.openURL("https://io.italia.it/documenti-su-io/")}
      />
      <VSpacer size={24} />
    </View>
  );
};

const styles = StyleSheet.create({
  margins: {
    marginHorizontal: IOVisualCostants.appMarginDefault,
    marginVertical: 16
  }
});
