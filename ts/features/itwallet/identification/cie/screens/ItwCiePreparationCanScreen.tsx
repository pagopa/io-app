import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Image } from "react-native";
import { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { trackItwIdCieCanTutorialCan } from "../../analytics";
import { selectIdentification } from "../../../machine/eid/selectors";

export const ItwCiePreparationCanScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  useFocusEffect(
    useCallback(() => {
      trackItwIdCieCanTutorialCan({ ITW_ID_method: identification?.mode });
    }, [identification])
  );

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
