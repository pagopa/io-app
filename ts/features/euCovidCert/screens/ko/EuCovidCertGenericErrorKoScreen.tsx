import * as React from "react";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import { Body, H4, Pictogram, VSpacer } from "@pagopa/io-app-design-system";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import I18n from "../../../../i18n";
import {
  BaseEuCovidCertificateLayout,
  BaseSingleButtonFooter
} from "../BaseEuCovidCertificateLayout";
import { useIODispatch } from "../../../../store/hooks";
import { euCovidCertificateGet } from "../../store/actions";
import { EUCovidContext } from "../../components/EUCovidContext";

const styles = StyleSheet.create({
  container: {
    alignItems: "center"
  },
  subtitle: {
    textAlign: "center"
  }
});

const EuCovidCertGenericErrorKoComponent = () => (
  <View style={styles.container}>
    <VSpacer size={40} />
    <VSpacer size={40} />
    <Pictogram name="umbrellaNew" />
    <VSpacer size={16} />
    <H4>{I18n.t("features.euCovidCertificate.ko.genericError.title")}</H4>
    <VSpacer size={8} />
    <Body style={styles.subtitle}>
      {I18n.t("features.euCovidCertificate.ko.genericError.subtitle")}
    </Body>
  </View>
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
