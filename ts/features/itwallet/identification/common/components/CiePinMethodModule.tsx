import { Badge, ModuleNavigationAlt } from "@pagopa/io-app-design-system";
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

  const badgeProps: Badge = {
    testID: "CiePinRecommendedBadgeTestID",
    text: I18n.t(
      "features.itWallet.identification.modeSelection.mode.ciePin.badge"
    ),
    variant: "highlight",
    outline: false
  };

  if (isL3) {
    return (
      <>
        <ModuleNavigationAlt
          testID="CiePinMethodModuleTestIDL3"
          title={I18n.t(
            "features.itWallet.identification.modeSelection.mode.ciePin.title"
          )}
          subtitle={I18n.t(
            "features.itWallet.identification.modeSelection.mode.ciePin.subtitle.l3"
          )}
          icon="fiscalCodeIndividual"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "ciePin",
              itw_flow: "L3"
            });
            ciePinBottomSheet.present();
          }}
        />
        {ciePinBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      testID="CiePinMethodModuleTestIDL2"
      title={I18n.t(
        "features.itWallet.identification.modeSelection.mode.ciePin.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.identification.modeSelection.mode.ciePin.subtitle.default"
      )}
      icon="fiscalCodeIndividual"
      onPress={handleOnPress}
      badge={isReissuanceMode ? badgeProps : undefined}
    />
  );
};
