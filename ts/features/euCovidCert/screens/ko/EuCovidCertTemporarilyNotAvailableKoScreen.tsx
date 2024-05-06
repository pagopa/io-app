import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Image } from "react-native";
import unavailableImage from "../../../../../img/wallet/errors/payment-expired-icon.png";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../i18n";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";

const EuCovidCertTemporarilyNotAvailableComponent = (): React.ReactElement => (
  <>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <InfoScreenComponent
      image={
        <Image
          accessibilityIgnoresInvertColors
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
          source={unavailableImage}
          style={{ width: 91, height: 105, resizeMode: "cover" }}
        />
      }
      title={I18n.t(
        "features.euCovidCertificate.ko.temporarilyNotAvailable.title"
      )}
      body={I18n.t(
        "features.euCovidCertificate.ko.temporarilyNotAvailable.subtitle"
      )}
    />
  </>
);

export const EuCovidCertTemporarilyNotAvailableKoScreen =
  (): React.ReactElement => (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertTemporarilyNotAvailableKoScreen"}
      content={<EuCovidCertTemporarilyNotAvailableComponent />}
    />
  );
