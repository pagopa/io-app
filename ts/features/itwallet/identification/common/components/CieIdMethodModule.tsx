import { ModuleNavigationAlt } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";
import { trackItWalletIDMethodSelected } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { useContinueWithBottomSheet } from "../hooks/useContinueWithBottomSheet";

type Props = {
  isL3: boolean;
};

export const CieIdMethodModule = ({ isL3 }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "cieId" });
  }, [machineRef]);

  const cieIdBottomSheet = useContinueWithBottomSheet({
    type: "cieId",
    onPrimaryAction: handleOnPress,
    isL3
  });

  if (isL3) {
    return (
      <>
        <ModuleNavigationAlt
          testID="CieIDMethodModuleTestIDL3"
          title={I18n.t(
            "features.itWallet.identification.modeSelection.mode.cieId.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.identification.modeSelection.mode.cieId.subtitle.l3"
          )}
          icon="cie"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "cieId",
              itw_flow: "L3"
            });
            cieIdBottomSheet.present();
          }}
        />
        {cieIdBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      testID="CieIDMethodModuleTestIDL2"
      title={I18n.t(
        "features.itWallet.identification.modeSelection.mode.cieId.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.identification.modeSelection.mode.cieId.subtitle.default"
      )}
      icon="cie"
      onPress={handleOnPress}
    />
  );
};
