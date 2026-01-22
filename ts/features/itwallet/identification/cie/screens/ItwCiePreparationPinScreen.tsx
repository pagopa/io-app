import { IOButton } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { trackItwCiePinTutorialPin } from "../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet";
import { useHardwareBackButton } from "../../../../../hooks/useHardwareBackButton";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";

export const ItwCiePreparationPinScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3FeaturesEnabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const itw_flow = isL3FeaturesEnabled ? "L3" : "L2";
  const navigation = useIONavigation();
  useFocusEffect(
    useCallback(() => {
      trackItwCiePinTutorialPin(itw_flow);
    }, [itw_flow])
  );

  useHardwareBackButton(() => {
    navigation.goBack();
    return true;
  });

  const infoBottomSheet = useCieInfoBottomSheet({
    type: "pin",
    showSecondaryAction: isL3FeaturesEnabled
  });

  return (
    <ItwCiePreparationScreenContent
      title={I18n.t(`features.itWallet.identification.cie.prepare.pin.title`)}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.pin.description`
      )}
      imageSrc={require("../../../../../../img/features/itWallet/identification/itw_cie_pin.gif")}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(`features.itWallet.identification.cie.prepare.pin.cta`),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
    >
      <IOButton
        variant="link"
        label={I18n.t(
          `features.itWallet.identification.cie.prepare.pin.buttonLink`
        )}
        onPress={() => infoBottomSheet.present()}
      />
      {infoBottomSheet.bottomSheet}
    </ItwCiePreparationScreenContent>
  );
};
