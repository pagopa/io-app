import * as React from "react";
import { StyleSheet, View } from "react-native";
import { H4, LoadingSpinner, VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import I18n from "../../../i18n";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  subtitle: {
    textAlign: "center"
  },
  title: {
    textAlign: "center"
  }
});

export const EuCovidCertLoadingScreen = (): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertLoadingScreen"}
    content={
      <View style={styles.container}>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <VSpacer size={40} />
        <VSpacer size={24} />
        <LoadingSpinner size={48} />
        <VSpacer size={24} />
        <H4 style={styles.title}>
          {I18n.t("features.euCovidCertificate.loading.title")}
        </H4>
        <VSpacer size={8} />
        <Body style={styles.subtitle}>
          {I18n.t("features.euCovidCertificate.loading.subtitle")}
        </Body>
      </View>
    }
  />
);
