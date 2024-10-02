import React from "react";
import { Banner } from "@pagopa/io-app-design-system";
import { Linking } from "react-native";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { isTrialActiveSelector } from "../../../trialSystem/store/reducers";
import { itwTrialId } from "../../../../config";

export const ItwUpcomingWalletBanner = () => {
  const isItwTrialActive = useIOSelector(isTrialActiveSelector(itwTrialId));

  if (isItwTrialActive) {
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
      onPress={() => Linking.openURL("https://io.italia.it/")}
    />
  );
};
