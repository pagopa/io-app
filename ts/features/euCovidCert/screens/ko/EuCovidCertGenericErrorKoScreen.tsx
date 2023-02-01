import * as React from "react";
import { useContext } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../img/servicesStatus/error-detail-icon.png";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import { confirmButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { euCovidCertificateGet } from "../../store/actions";
import { EUCovidCertificateAuthCode } from "../../types/EUCovidCertificate";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";
import { EUCovidContext } from "../EuCovidCertificateRouterScreen";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const EuCovidCertGenericErrorKoComponent = () => (
  <>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <InfoScreenComponent
      image={renderInfoRasterImage(image)}
      title={I18n.t("features.euCovidCertificate.ko.genericError.title")}
      body={
        <Body style={{ textAlign: "center" }}>
          {I18n.t("features.euCovidCertificate.ko.genericError.subtitle")}
        </Body>
      }
    />
  </>
);

type FooterProps = {
  onPress: () => void;
};

const Footer = (props: FooterProps) => (
  <FooterWithButtons
    type={"SingleButton"}
    leftButton={confirmButtonProps(
      props.onPress,
      I18n.t("global.buttons.retry")
    )}
  />
);

const EuCovidCertGenericErrorKoScreen = (props: Props): React.ReactElement => {
  const currentCertificate = useContext(EUCovidContext);
  // read from the store the authCode for the current certificate and create the refresh callback
  const authCode = currentCertificate?.authCode;
  const reloadCertificate = authCode ? () => props.reload(authCode) : undefined;

  // reloadCertificate === undefined should never happens, handled with WorkunitGenericFailure
  return reloadCertificate ? (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertGenericErrorKoScreen"}
      content={<EuCovidCertGenericErrorKoComponent />}
      footer={<Footer onPress={reloadCertificate} />}
    />
  ) : (
    <WorkunitGenericFailure />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reload: (authCode: EUCovidCertificateAuthCode) =>
    dispatch(euCovidCertificateGet.request(authCode))
});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EuCovidCertGenericErrorKoScreen);
