import * as React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { IOStackNavigationRouteProps } from "../../../../navigation/params/AppParamsList";
import { useMaxBrightness } from "../../../../utils/brightness";
import { withBase64Uri } from "../../../../utils/image";
import { cancelButtonProps } from "../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { EUCovidCertParamsList } from "../../navigation/params";

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
  return (
    <BaseScreenComponent goBack={true}>
      <SafeAreaView
        style={IOStyles.flex}
        testID={"EuCovidCertQrCodeFullScreen"}
      >
        <ScrollView>
          <VSpacer size={40} />
          <VSpacer size={40} />
          <Image
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
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps(
            () => props.navigation.goBack(),
            I18n.t("global.buttons.close")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
