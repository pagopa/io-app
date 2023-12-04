/* eslint-disable arrow-body-style */
import React from "react";
import { FeatureInfo, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import I18n from "../../../i18n";
import { openWebUrl } from "../../../utils/url";

const SecuritySuggestions = () => {
  return (
    <View>
      <FeatureInfo
        iconName="biomFingerprint"
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
