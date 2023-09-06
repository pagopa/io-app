import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Image } from "react-native";
import { VSpacer } from "@pagopa/io-app-design-system";
import { GlobalState } from "../../../../store/reducers/types";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import unavailableImage from "../../../../../img/wallet/errors/payment-expired-icon.png";
import I18n from "../../../../i18n";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const EuCovidCertTemporarilyNotAvailableComponent = (): React.ReactElement => (
  <>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <InfoScreenComponent
      image={
        <Image
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

const EuCovidCertTemporarilyNotAvailableKoScreen = (
  _: Props
): React.ReactElement => (
  <BaseEuCovidCertificateLayout
    testID={"EuCovidCertTemporarilyNotAvailableKoScreen"}
    content={<EuCovidCertTemporarilyNotAvailableComponent />}
  />
);

const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertTemporarilyNotAvailableKoScreen);
