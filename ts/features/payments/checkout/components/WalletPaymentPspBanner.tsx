import { Banner, VSpacer } from "@pagopa/io-app-design-system";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import { useRef } from "react";
import * as O from "fp-ts/lib/Option";

import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";

import { View } from "react-native";
import I18n from "i18next";
import { mixpanelTrack } from "../../../../mixpanel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  isPaymentsPspBannerEnabledSelector,
  paymentsPspBannerConfigSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  fallbackForLocalizedMessageKeys,
  getFullLocale
} from "../../../../utils/locale";
import {
  isPaymentsPspBannerClosedSelector,
  walletPaymentSelectedPaymentMethodOptionSelector
} from "../store/selectors/paymentMethods";
import { paymentMethodPspBannerClose } from "../store/actions/orchestration";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import * as analytics from "../analytics";

const WalletPaymentPspBanner = () => {
  const dispatch = useIODispatch();
  const bannerViewRef = useRef<View>(null);
  const selectedPaymentMethodOption = useIOSelector(
    walletPaymentSelectedPaymentMethodOptionSelector
  );
  const selectedPaymentMethod = O.toNullable(selectedPaymentMethodOption);
  const selectedPaymentMethodName = selectedPaymentMethod?.name ?? "";
  const isBannerEnabled = useIOSelector(
    isPaymentsPspBannerEnabledSelector(selectedPaymentMethodName)
  );
  const isBannerClosed = useIOSelector(
    isPaymentsPspBannerClosedSelector(selectedPaymentMethodName)
  );
  const bannerConfig = useIOSelector(
    paymentsPspBannerConfigSelector(selectedPaymentMethodName)
  );
  const locale = getFullLocale();
  const localeFallback = fallbackForLocalizedMessageKeys(locale);

  const handleBannerPress = () => {
    if (!bannerConfig?.action) {
      return;
    }
    void mixpanelTrack("VOC_USER_EXIT", {
      screen_name: "PAYMENT_PICK_PSP_SCREEN"
    });
    return openAuthenticationSession(bannerConfig.action.url, "");
  };

  const handleBannerClose = () => {
    analytics.trackPaymentMyBankPspBannerClose();
    dispatch(paymentMethodPspBannerClose(selectedPaymentMethodName));
  };

  useOnFirstRender(() => analytics.trackPaymentMyBankPspBanner());

  if (!isBannerEnabled || !bannerConfig || isBannerClosed) {
    return null;
  }

  return (
    <>
      <VSpacer size={8} />
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        layout={LinearTransition.duration(200)}
      >
        <Banner
          color="neutral"
          pictogramName="help"
          ref={bannerViewRef}
          title={bannerConfig.title?.[localeFallback]}
          content={bannerConfig.description[localeFallback]}
          action={bannerConfig.action?.label[localeFallback] ?? ""}
          onPress={handleBannerPress}
          onClose={handleBannerClose}
          labelClose={I18n.t("global.buttons.close")}
        />
      </Animated.View>
      <VSpacer size={16} />
    </>
  );
};

export { WalletPaymentPspBanner };
