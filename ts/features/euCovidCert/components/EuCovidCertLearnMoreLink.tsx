import * as React from "react";
import { ButtonLink } from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { euCovidCertificateUrl } from "../../../urls";
import { openWebUrl } from "../../../utils/url";

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  }
});

export const EuCovidCertLearnMoreLink = (): React.ReactElement => (
  <View style={styles.container}>
    <View>
      <ButtonLink
        label={I18n.t("features.euCovidCertificate.common.learnMore")}
        accessibilityHint={I18n.t("global.accessibility.linkHint")}
        onPress={() => openWebUrl(euCovidCertificateUrl)}
        testID="euCovidCertLearnMoreLink"
      />
    </View>
  </View>
);
