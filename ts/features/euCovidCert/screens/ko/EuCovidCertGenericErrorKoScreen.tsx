import {
  Body,
  FooterWithButtons,
  H4,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { useContext } from "react";
import { StyleSheet, View } from "react-native";
import WorkunitGenericFailure from "../../../../components/error/WorkunitGenericFailure";
import I18n from "../../../../i18n";
import { useIODispatch } from "../../../../store/hooks";
import { EUCovidContext } from "../../components/EUCovidContext";
import { euCovidCertificateGet } from "../../store/actions";
import { BaseEuCovidCertificateLayout } from "../BaseEuCovidCertificateLayout";

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
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("global.buttons.retry"),
              accessibilityLabel: I18n.t("global.buttons.retry"),
              onPress: reloadCertificate
            }
          }}
        />
      }
    />
  ) : (
    <WorkunitGenericFailure />
  );
};
