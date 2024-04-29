import * as React from "react";
import { useContext } from "react";
import { VSpacer } from "@pagopa/io-app-design-system";
import image from "../../../../../img/servicesStatus/error-detail-icon.png";
import { Body } from "../../../../components/core/typography/Body";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import I18n from "../../../../i18n";
import {
  BaseEuCovidCertificateLayout,
  BaseSingleButtonFooter
} from "../BaseEuCovidCertificateLayout";
import { useIODispatch } from "../../../../store/hooks";
import { euCovidCertificateGet } from "../../store/actions";
import { EUCovidContext } from "../../components/EUCovidContext";

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

export const EuCovidCertGenericErrorKoScreen = (): React.ReactElement => {
  const currentCertificate = useContext(EUCovidContext);
  const dispatch = useIODispatch();
  // read from the store the authCode for the current certificate and create the refresh callback
  const authCode = currentCertificate?.authCode;
  const reloadCertificate = React.useCallback(() => {
    if (authCode) {
      dispatch(euCovidCertificateGet.request(authCode));
    }
  }, [authCode, dispatch]);

  // reloadCertificate === undefined should never happens, handled with WorkunitGenericFailure
  return reloadCertificate ? (
    <BaseEuCovidCertificateLayout
      testID={"EuCovidCertGenericErrorKoScreen"}
      content={<EuCovidCertGenericErrorKoComponent />}
      footer={
        <BaseSingleButtonFooter
          onPress={reloadCertificate}
          title={I18n.t("global.buttons.retry")}
        />
      }
    />
  ) : (
    <WorkunitGenericFailure />
  );
};
