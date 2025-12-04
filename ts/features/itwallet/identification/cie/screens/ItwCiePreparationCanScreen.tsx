import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Image } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";

export const ItwCiePreparationCanScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  return (
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
          onPress: () => machineRef.send({ type: "next" })
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
};
