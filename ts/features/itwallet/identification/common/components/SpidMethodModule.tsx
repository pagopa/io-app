import { ModuleNavigationAlt } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useCallback } from "react";

import { trackItWalletIDMethodSelected } from "../../../analytics";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { useContinueWithBottomSheet } from "../hooks/useContinueWithBottomSheet";

type Props = {
  isL3: boolean;
};

export const SpidMethodModule = ({ isL3 }: Props) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const handleOnPress = useCallback(() => {
    machineRef.send({ type: "select-identification-mode", mode: "spid" });
  }, [machineRef]);

  const spidBottomSheet = useContinueWithBottomSheet({
    type: "spid",
    onPrimaryAction: handleOnPress,
    isL3
  });

  if (isL3) {
    return (
      <>
        <ModuleNavigationAlt
          icon="spid"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "spid",
              itw_flow: "L3"
            });
            spidBottomSheet.present();
          }}
          subtitle={I18n.t(
            "features.itWallet.identification.modeSelection.mode.spid.subtitle.l3"
          )}
          testID="SpidMethodModuleTestIDL3"
          title={I18n.t(
            "features.itWallet.identification.modeSelection.mode.spid.title.l3"
          )}
        />
        {spidBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      icon="spid"
      onPress={handleOnPress}
      subtitle={I18n.t(
        "features.itWallet.identification.modeSelection.mode.spid.subtitle.default"
      )}
      testID="SpidMethodModuleTestIDL2"
      title={I18n.t(
        "features.itWallet.identification.modeSelection.mode.spid.title.default"
      )}
    />
  );
};
