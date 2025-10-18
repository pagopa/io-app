import { Banner, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import I18n from "i18next";
import { useEffect } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition
} from "react-native-reanimated";
import { mixpanelTrack } from "../../../../mixpanel";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { buildEventProperties } from "../../../../utils/analytics";
import { usePrevious } from "../../../../utils/hooks/usePrevious";
import {
  trackIDPayOnboardingEmailActivationError,
  trackIDPayOnboardingEmailActivationSuccess
} from "../../../idpay/onboarding/analytics";
import { setIdPayOnboardingSucceeded } from "../../../idpay/wallet/store/actions";
import { isIdPayOnboardingSucceededSelector } from "../../../idpay/wallet/store/reducers";
import { profileUpsert } from "../../../settings/common/store/actions";
import {
  isEmailEnabledSelector,
  profileSelector
} from "../../../settings/common/store/selectors";
import { SERVICES_ROUTES } from "../../common/navigation/routes";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

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

  const mixPanelTracking = (type: "TAP_BANNER" | "CLOSE_BANNER") =>
    mixpanelTrack(
      type,
      buildEventProperties("UX", "action", {
        banner_id: "IDPAY_EMAIL_ACTIVATION",
        banner_page: SERVICES_ROUTES.SERVICES_HOME
      })
    );

  const handleOnEnableEmailChannel = () => {
    mixPanelTracking("TAP_BANNER");

    dispatch(
      profileUpsert.request({
        is_email_enabled: true
      })
    );
  };

  useOnFirstRender(() => {
    mixpanelTrack(
      "BANNER",
      buildEventProperties("UX", "screen_view", {
        banner_id: "IDPAY_EMAIL_ACTIVATION",
        banner_page: SERVICES_ROUTES.SERVICES_HOME
      })
    );
  });

  useEffect(() => {
    if (prevProfile && pot.isUpdating(prevProfile)) {
      if (pot.isError(profile)) {
        IOToast.error(I18n.t("global.genericError"));
        trackIDPayOnboardingEmailActivationError();
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
        trackIDPayOnboardingEmailActivationSuccess();
        return;
      }
    }
  }, [profile, prevProfile, canShowBanner, dispatch]);

  const handleOnCloseBanner = () => {
    mixPanelTracking("CLOSE_BANNER");
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
