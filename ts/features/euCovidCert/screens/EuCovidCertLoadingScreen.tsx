import * as React from "react";
import { View, ActivityIndicator } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import { Body } from "../../../components/core/typography/Body";
import { InfoScreenComponent } from "../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../i18n";
import { BaseEuCovidCertificateLayout } from "./BaseEuCovidCertificateLayout";

const euActivityIndicator = (
  <ActivityIndicator
    color={"black"}
    size={"large"}
    accessible={false}
    importantForAccessibility={"no-hide-descendants"}
    accessibilityElementsHidden={true}
  />
);

export const EuCovidCertLoadingScreen = (): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertLoadingScreen"}
    content={
      <View>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <VSpacer size={40} />
        <InfoScreenComponent
          image={euActivityIndicator}
          title={I18n.t("features.euCovidCertificate.loading.title")}
          body={
            <Body>
              {I18n.t("features.euCovidCertificate.loading.subtitle")}
            </Body>
          }
        />
      </View>
    }
  />
);
