import { IOButton } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";

import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { trackItwCiePinTutorialPin } from "../../analytics";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";

export const ItwCiePreparationPinScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const itw_flow = isL3FeaturesEnabled ? "L3" : "L2";

  useFocusEffect(
    useCallback(() => {
      trackItwCiePinTutorialPin(itw_flow);
    }, [itw_flow])
  );

  const infoBottomSheet = useCieInfoBottomSheet({
    type: "pin",
    showSecondaryAction: isL3FeaturesEnabled
  });

  return (
    <ItwCiePreparationScreenContent
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(`features.itWallet.identification.cie.prepare.pin.cta`),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.pin.description`
      )}
      imageSrc={require("../../../../../../img/features/itWallet/identification/itw_cie_pin.gif")}
      title={I18n.t(`features.itWallet.identification.cie.prepare.pin.title`)}
    >
      <IOButton
        label={I18n.t(
          `features.itWallet.identification.cie.prepare.pin.buttonLink`
        )}
        onPress={() => infoBottomSheet.present()}
        variant="link"
      />
      {infoBottomSheet.bottomSheet}
    </ItwCiePreparationScreenContent>
  );
};
