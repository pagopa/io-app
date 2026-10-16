import { ModuleNavigationAlt } from "@io-app/design-system";
import I18n from "i18next";
import { useCallback } from "react";

import { trackItWalletIDMethodSelected } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { useContinueWithBottomSheet } from "../hooks/useContinueWithBottomSheet";

type Props = {
  isL3: boolean;
  isReissuanceMode?: boolean;
};

export const CiePinMethodModule = ({
  isL3,
  isReissuanceMode = false
}: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "ciePin" });
  }, [machineRef]);

  const ciePinBottomSheet = useContinueWithBottomSheet({
    type: "ciePin",
    onPrimaryAction: handleOnPress,
    isL3
  });

  if (isL3) {
    return (
      <>
        <ModuleNavigationAlt
          icon="fiscalCodeIndividual"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "ciePin",
              itw_flow: "L3"
            });
            ciePinBottomSheet.present();
          }}
          subtitle={
            isReissuanceMode
              ? undefined
              : I18n.t(
                  `features.itWallet.identification.modeSelection.mode.ciePin.subtitle.l3`
                )
          }
          testID="CiePinMethodModuleTestIDL3"
          title={I18n.t(
            `features.itWallet.identification.modeSelection.mode.ciePin.title.l3`
          )}
        />
        {ciePinBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      icon="fiscalCodeIndividual"
      onPress={handleOnPress}
      subtitle={I18n.t(
        `features.itWallet.identification.modeSelection.mode.ciePin.subtitle.default`
      )}
      testID="CiePinMethodModuleTestIDL2"
      title={
        isReissuanceMode
          ? I18n.t(
              `features.itWallet.identification.modeSelection.mode.ciePin.title.default_reissuance`
            )
          : I18n.t(
              `features.itWallet.identification.modeSelection.mode.ciePin.title.default`
            )
      }
    />
  );
};
