import React from "react";
import { Banner } from "@pagopa/io-app-design-system";
import { Linking } from "react-native";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { trialStatusSelector } from "../../../trialSystem/store/reducers";
import { itwTrialId } from "../../../../config";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";
import { isItwEnabledSelector } from "../../../../store/reducers/backendStatus";

export const ItwUpcomingWalletBanner = () => {
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const itwTrialStatus = useIOSelector(trialStatusSelector(itwTrialId));

  if (!isItwEnabled || itwTrialStatus !== SubscriptionStateEnum.SUBSCRIBED) {
    return null;
  }

  return (
    <Banner
      color="neutral"
      size="big"
      pictogramName="notification"
      title={I18n.t("features.itWallet.discovery.upcomingWalletBanner.title")}
      content={I18n.t(
        "features.itWallet.discovery.upcomingWalletBanner.content"
      )}
      action={I18n.t("features.itWallet.discovery.upcomingWalletBanner.action")}
      onPress={() => Linking.openURL("https://io.italia.it/")} // TODO: [SIW-1716] Update the URL
    />
  );
};
