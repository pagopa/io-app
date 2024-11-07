import React from "react";
import { Banner, IOSpacer, VSpacer } from "@pagopa/io-app-design-system";
import { Linking } from "react-native";
import I18n from "../../../../../i18n";
import { useIOSelector } from "../../../../../store/hooks";
import { trialStatusSelector } from "../../../../trialSystem/store/reducers";
import { itwDocumentsOnIOUrl, itwTrialId } from "../../../../../config";
import { SubscriptionStateEnum } from "../../../../../../definitions/trial_system/SubscriptionState";

type ItwUpcomingWalletBannerProps = {
  bottomSpacing?: IOSpacer;
};

export const ItwUpcomingWalletBanner = ({
  bottomSpacing
}: ItwUpcomingWalletBannerProps) => {
  const itwTrialStatus = useIOSelector(trialStatusSelector(itwTrialId));

  if (itwTrialStatus === SubscriptionStateEnum.ACTIVE) {
    return null;
  }

  return (
    <>
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
      {bottomSpacing && <VSpacer size={bottomSpacing} />}
    </>
  );
};
