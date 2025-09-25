import { ContentWrapper } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";

export const ItwCiePreparationCanScreen = () => (
  <IOScrollViewWithLargeHeader
    title={{
      label: I18n.t(`features.itWallet.identification.cie.prepare.can.title`)
    }}
    description={I18n.t(
      `features.itWallet.identification.cie.prepare.can.content`
    )}
    headerActionsProp={{ showHelp: true }}
    actions={{
      type: "SingleButton",
      primary: {
        label: I18n.t(`features.itWallet.identification.cie.prepare.can.cta`),
        onPress: constNull
      }
    }}
  >
    <ContentWrapper>
      <View style={[styles.imageContainer, { height: screenHeight * 0.5 }]}>
        <Image
          accessibilityIgnoresInvertColors
          source={require("../../../../../../img/features/itWallet/identification/cie_can.png")}
          resizeMode="contain"
          style={styles.image}
        />
      </View>
    </ContentWrapper>
  </IOScrollViewWithLargeHeader>
);

// Get the screen height to calculate a responsive image container height
const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  imageContainer: {
    width: "100%",
    marginTop: 15,
    height: screenHeight * 0.5
  },
  image: {
    width: "100%",
    height: "100%"
  }
});
