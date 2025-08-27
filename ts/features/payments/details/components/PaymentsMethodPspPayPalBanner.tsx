import { useRef } from "react";
import { VSpacer, Banner } from "@pagopa/io-app-design-system";

import Animated, { FadeOut } from "react-native-reanimated";
import { View } from "react-native";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paymentsPayPalBannerSetIsClosedAction } from "../store/actions";
import { walletPayPalBannerClosedSelector } from "../store/selectors";

const PaymentsMethodPspPayPalBanner = () => {
  const bannerViewRef = useRef<View>(null);
  const dispatch = useIODispatch();
  const bannerClosed = useIOSelector(walletPayPalBannerClosedSelector);

  const handleOnCloseBanner = () => {
    dispatch(paymentsPayPalBannerSetIsClosedAction(true));
  };

  if (!bannerClosed) {
    return (
      // The zIndex is set to 9999 due to a known bug of react-native-reanimated (https://github.com/software-mansion/react-native-reanimated/issues/4534)
      <Animated.View exiting={FadeOut.duration(200)} style={{ zIndex: 9999 }}>
        <Banner
          color="neutral"
          pictogramName="help"
          title={I18n.t("features.payments.details.payPal.banner.title")}
          content={I18n.t("features.payments.details.payPal.banner.content")}
          onClose={handleOnCloseBanner}
          labelClose={I18n.t(
            "idpay.initiative.discountDetails.IDPayCode.banner.close"
          )}
          ref={bannerViewRef}
        />
        <VSpacer size={24} />
      </Animated.View>
    );
  }

  return undefined;
};

export { PaymentsMethodPspPayPalBanner };
