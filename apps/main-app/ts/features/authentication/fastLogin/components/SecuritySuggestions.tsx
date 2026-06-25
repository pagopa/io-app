import { FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { absolutePortalLinksSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { openWebUrl } from "../../../../utils/url";
import { trackWhatsNewScreen } from "../../../whatsnew/analytics";
import { setSecurityAdviceAcknowledged } from "../store/actions/securityAdviceActions";

const SecuritySuggestions = () => {
  const dispatch = useIODispatch();
  const absolutePortalLinks = useIOSelector(absolutePortalLinksSelector);

  useOnFirstRender(() => {
    dispatch(setSecurityAdviceAcknowledged(true));
    trackWhatsNewScreen();
  });

  return (
    <View>
      <FeatureInfo
        body={I18n.t("authentication.security_suggestions.fingerprint")}
        iconName="fingerprint"
      />
      <VSpacer size={24} />
      <FeatureInfo
        action={{
          label: I18n.t(
            "authentication.security_suggestions.navigate_to_the_site"
          ),
          onPress: () => openWebUrl(absolutePortalLinks.io_web)
        }}
        body={I18n.t("authentication.security_suggestions.io_logout")}
        iconName="logout"
      />
      <VSpacer size={24} />
      <FeatureInfo
        action={{
          label: I18n.t(
            "authentication.security_suggestions.navigate_to_the_site"
          ),
          onPress: () => openWebUrl(absolutePortalLinks.io_web)
        }}
        body={I18n.t("authentication.security_suggestions.io_lock_access")}
        iconName="locked"
      />
      <VSpacer size={24} />
      <FeatureInfo
        body={I18n.t("authentication.security_suggestions.access_new_device")}
        iconName="device"
      />
      <VSpacer size={24} />
    </View>
  );
};

export default SecuritySuggestions;
