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

export const SpidMethodModule = ({ isL3, isReissuanceMode = false }: Props) => {
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
          testID="SpidMethodModuleTestIDL3"
          title={I18n.t(
            `features.itWallet.identification.modeSelection.mode.spid.title.l3`
          )}
          subtitle={
            isReissuanceMode
              ? undefined
              : I18n.t(
                  `features.itWallet.identification.modeSelection.mode.spid.subtitle.l3`
                )
          }
          icon="spid"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "spid",
              itw_flow: "L3"
            });
            spidBottomSheet.present();
          }}
        />
        {spidBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      testID="SpidMethodModuleTestIDL2"
      title={
        isReissuanceMode
          ? I18n.t(
              `features.itWallet.identification.modeSelection.mode.spid.title.default_reissuance`
            )
          : I18n.t(
              `features.itWallet.identification.modeSelection.mode.spid.title.default`
            )
      }
      subtitle={I18n.t(
        `features.itWallet.identification.modeSelection.mode.spid.subtitle.default`
      )}
      icon="spid"
      onPress={handleOnPress}
    />
  );
};
