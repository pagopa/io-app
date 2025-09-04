import { Banner, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";
import { useEffect } from "react";
import I18n from "i18next";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isIdPayOnboardingSucceededSelector } from "../../../idpay/wallet/store/reducers";
import {
  isEmailEnabledSelector,
  profileSelector
} from "../../../settings/common/store/selectors";
import { profileUpsert } from "../../../settings/common/store/actions";
import { usePrevious } from "../../../../utils/hooks/usePrevious";
import { setIdPayOnboardingSucceeded } from "../../../idpay/wallet/store/actions";

export const EmailNotificationBanner = () => {
  const dispatch = useIODispatch();
  const isIdPayOnboardingSucceeded = useIOSelector(
    isIdPayOnboardingSucceededSelector
  );
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);
  const isEmailChannelEnabled = useIOSelector(isEmailEnabledSelector);
  const profile = useIOSelector(profileSelector);
  const prevProfile = usePrevious(profile);

  const canShowBanner =
    isIdPayEnabled && isIdPayOnboardingSucceeded && !isEmailChannelEnabled;

  const handleOnEnableEmailChannel = () => {
    dispatch(
      profileUpsert.request({
        is_email_enabled: true
      })
    );
  };

  useEffect(() => {
    if (prevProfile && pot.isUpdating(prevProfile)) {
      if (pot.isError(profile)) {
        IOToast.error(I18n.t("global.genericError"));
        return;
      }
      if (pot.isSome(profile)) {
        dispatch(setIdPayOnboardingSucceeded(false));
        IOToast.hideAll();
        IOToast.success(
          I18n.t(
            "idpay.onboarding.preferences.enableEmailBanner.successOutcome"
          )
        );
        return;
      }
    }
  }, [profile, prevProfile, canShowBanner, dispatch]);

  const handleOnCloseBanner = () => {
    dispatch(setIdPayOnboardingSucceeded(false));
  };

  if (!canShowBanner) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      layout={LinearTransition.duration(300)}
    >
      <VSpacer size={16} />
      <Banner
        labelClose={I18n.t("global.buttons.close")}
        onClose={handleOnCloseBanner}
        color="turquoise"
        pictogramName="emailDotNotif"
        title={I18n.t("idpay.onboarding.preferences.enableEmailBanner.title")}
        content={I18n.t(
          "idpay.onboarding.preferences.enableEmailBanner.content"
        )}
        action={I18n.t("idpay.onboarding.preferences.enableEmailBanner.cta")}
        onPress={handleOnEnableEmailChannel}
      />
    </Animated.View>
  );
};
