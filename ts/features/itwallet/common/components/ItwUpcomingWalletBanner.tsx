import React from "react";
import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { useIOSelector } from "../../../../store/hooks";
import { trialStatusSelector } from "../../../trialSystem/store/reducers";
import { itwTrialId } from "../../../../config";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";
import { isItwEnabledSelector } from "../../../../store/reducers/backendStatus";

type ItwUpcomingWalletBannerProps = {
  vSpacer?: boolean;
};

export const ItwUpcomingWalletBanner = ({
  vSpacer
}: ItwUpcomingWalletBannerProps) => {
  const isItwEnabled = useIOSelector(isItwEnabledSelector);
  const itwTrialStatus = useIOSelector(trialStatusSelector(itwTrialId));

  if (isItwEnabled || itwTrialStatus === SubscriptionStateEnum.ACTIVE) {
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
        // action={I18n.t(
        //   "features.itWallet.discovery.upcomingWalletBanner.action"
        // )}
        // onPress={() => Linking.openURL("https://io.italia.it/documenti-su-io/")} //At the moment, the page is not available
      />
      {vSpacer && <VSpacer size={24} />}
    </>
  );
};
