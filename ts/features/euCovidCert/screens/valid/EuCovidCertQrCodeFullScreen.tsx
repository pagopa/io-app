import { VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { Dimensions, Image, ScrollView, StyleSheet } from "react-native";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useMaxBrightness } from "../../../../utils/brightness";
import { withBase64Uri } from "../../../../utils/image";
import { EUCovidCertParamsList } from "../../navigation/params";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { BaseSingleButtonFooter } from "../BaseEuCovidCertificateLayout";

export type EuCovidCertQrCodeFullScreenNavigationParams = Readonly<{
  qrCodeContent: string;
}>;

const styles = StyleSheet.create({
  qrCode: {
    // TODO: it's preferable to use the hook useWindowDimensions, but we need to upgrade react native
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").width,
    flex: 1
  }
});

export const EuCovidCertQrCodeFullScreen = (
  props: IOStackNavigationRouteProps<
    EUCovidCertParamsList,
    "EUCOVIDCERT_QRCODE"
  >
): React.ReactElement => {
  useMaxBrightness();
  useHeaderSecondLevel({
    title: "",
    supportRequest: true
  });
  return (
    <>
      <ScrollView>
        <VSpacer size={40} />
        <VSpacer size={40} />
        <Image
          accessibilityIgnoresInvertColors
          testID="fullScreenQRCode"
          accessible={true}
          accessibilityRole={"image"}
          accessibilityLabel={I18n.t(
            "features.euCovidCertificate.valid.accessibility.qrCode"
          )}
          source={{
            uri: withBase64Uri(props.route.params.qrCodeContent, "png")
          }}
          style={styles.qrCode}
        />
      </ScrollView>
      <BaseSingleButtonFooter
        onPress={() => props.navigation.goBack()}
        title={I18n.t("global.buttons.close")}
      />
    </>
  );
};
