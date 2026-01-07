import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { trackItwCiePinTutorialCie } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import {
  isL3FeaturesEnabledSelector,
  selectIdentification
} from "../../../machine/eid/selectors";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";

export const ItwCiePreparationNfcScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  const itw_flow = isL3FeaturesEnabled ? "L3" : "L2";

  useFocusEffect(
    useCallback(() => {
      trackItwCiePinTutorialCie({
        itw_flow,
        ITW_ID_method: identification?.mode
      });
    }, [itw_flow, identification])
  );

  const infoBottomSheet = useCieInfoBottomSheet({
    type: "card",
    showSecondaryAction: isL3FeaturesEnabled
  });

  return (
    <ItwCiePreparationScreenContent
      title={I18n.t(`features.itWallet.identification.cie.prepare.nfc.title`)}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.nfc.description`
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
      {infoBottomSheet.bottomSheet}
    </ItwCiePreparationScreenContent>
  );
};
