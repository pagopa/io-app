import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { Image } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";

export const ItwCiePreparationCanScreen = () => (
  <IOScrollViewWithLargeHeader
    title={{
      label: I18n.t(`features.itWallet.identification.cie.prepare.can.title`)
    }}
    description={I18n.t(
      `features.itWallet.identification.cie.prepare.can.description`
    )}
    headerActionsProp={{ showHelp: true }}
    actions={{
      type: "SingleButton",
      primary: {
        label: I18n.t(`features.itWallet.identification.cie.prepare.can.cta`),
        onPress: constNull // TODO [SIW-3045] continue with CAN authentication
      }
    }}
  >
    <ContentWrapper>
      <VSpacer size={8} />
      <Image
        accessibilityIgnoresInvertColors
        source={require("../../../../../../img/features/itWallet/identification/cie_can.png")}
        resizeMode="contain"
      />
    </ContentWrapper>
  </IOScrollViewWithLargeHeader>
);
