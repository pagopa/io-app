import { Banner } from "@pagopa/io-app-design-system";
import React from "react";
import { Linking, View } from "react-native";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";
import { itwDocumentsOnIOUrl, itwTrialId } from "../../../../config";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { trialStatusSelector } from "../../../trialSystem/store/reducers";

export const ItwUpcomingWalletBanner = () => {
  const itwTrialStatus = useIOSelector(trialStatusSelector(itwTrialId));

  if (itwTrialStatus === SubscriptionStateEnum.ACTIVE) {
    return null;
  }

  return (
    <View style={{ marginTop: 16, marginBottom: 8 }}>
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
        onPress={() => Linking.openURL(itwDocumentsOnIOUrl)}
      />
    </View>
  );
};
