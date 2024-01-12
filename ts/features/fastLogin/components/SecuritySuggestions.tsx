import React from "react";
import { FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "../../../i18n";
import { openWebUrl } from "../../../utils/url";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { setSecurityAdviceAcknowledged } from "../store/actions/securityAdviceActions";
import { trackWhatsNewScreen } from "../../whatsnew/analytics";
import { isProfileFirstOnBoardingSelector } from "../../../store/reducers/profile";
import { getFlowType } from "../../../utils/analytics";

const SecuritySuggestions = () => {
  const dispatch = useIODispatch();
  const isFirstOnBoarding = useIOSelector(isProfileFirstOnBoardingSelector);

  useOnFirstRender(() => {
    const flow = getFlowType(false, isFirstOnBoarding, true);

    dispatch(setSecurityAdviceAcknowledged(true));
    trackWhatsNewScreen(flow);
  });

  return (
    <View>
      <FeatureInfo
        iconName="fingerprint"
        body={I18n.t("authentication.security_suggestions.fingerprint")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="logout"
        body={I18n.t("authentication.security_suggestions.io_logout")}
        actionLabel={I18n.t(
          "authentication.security_suggestions.navigate_to_the_site"
        )}
        actionOnPress={() => openWebUrl("https://ioapp.it/")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="locked"
        body={I18n.t("authentication.security_suggestions.io_lock_access")}
        actionLabel={I18n.t(
          "authentication.security_suggestions.navigate_to_the_site"
        )}
        actionOnPress={() => openWebUrl("https://ioapp.it/")}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="device"
        body={I18n.t("authentication.security_suggestions.access_new_device")}
      />
      <VSpacer size={24} />
    </View>
  );
};

export default SecuritySuggestions;
