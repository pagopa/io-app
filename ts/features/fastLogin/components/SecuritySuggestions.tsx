import { FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "../../../i18n";
import { openWebUrl } from "../../../utils/url";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { useIODispatch } from "../../../store/hooks";
import { setSecurityAdviceAcknowledged } from "../store/actions/securityAdviceActions";
import { trackWhatsNewScreen } from "../../whatsnew/analytics";

const SecuritySuggestions = () => {
  const dispatch = useIODispatch();

  useOnFirstRender(() => {
    dispatch(setSecurityAdviceAcknowledged(true));
    trackWhatsNewScreen();
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
        action={{
          label: I18n.t(
            "authentication.security_suggestions.navigate_to_the_site"
          ),
          onPress: () => openWebUrl("https://ioapp.it/")
        }}
      />
      <VSpacer size={24} />
      <FeatureInfo
        iconName="locked"
        body={I18n.t("authentication.security_suggestions.io_lock_access")}
        action={{
          label: I18n.t(
            "authentication.security_suggestions.navigate_to_the_site"
          ),
          onPress: () => openWebUrl("https://ioapp.it/")
        }}
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
