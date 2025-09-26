import { IOButton } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { trackItwCiePinTutorialCie } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";

export const ItwCiePreparationNfcScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );

  const itw_flow = isL3FeaturesEnabled ? "L3" : "L2";

  useFocusEffect(
    useCallback(() => {
      trackItwCiePinTutorialCie(itw_flow);
    }, [itw_flow])
  );

  const infoBottomSheet = useCieInfoBottomSheet({
    type: "card",
    showSecondaryAction: isL3FeaturesEnabled
  });

  return (
    <ItwCiePreparationScreenContent
      title={I18n.t(`features.itWallet.identification.cie.prepare.card.title`)}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.card.description`
      )}
      imageSrc={require("../../../../../../img/features/itWallet/identification/itw_cie_nfc.gif")}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(`features.itWallet.identification.cie.prepare.nfc.cta`),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
    >
      <IOButton
        variant="link"
        label={I18n.t(
          `features.itWallet.identification.cie.prepare.nfc.buttonLink`
        )}
        onPress={() => infoBottomSheet.present()}
      />
      {infoBottomSheet.bottomSheet}
    </ItwCiePreparationScreenContent>
  );
};
