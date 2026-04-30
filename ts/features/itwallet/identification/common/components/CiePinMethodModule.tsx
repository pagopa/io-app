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
  const translationKey =
    "features.itWallet.identification.modeSelection.mode.ciePin";

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
          title={I18n.t(`${translationKey}.title.l3`)}
          subtitle={
            isReissuanceMode
              ? undefined
              : I18n.t(`${translationKey}.subtitle.l3`)
          }
          icon="fiscalCodeIndividual"
          onPress={() => {
            trackItWalletIDMethodSelected({
              ITW_ID_method: "ciePin",
              itw_flow: "L3"
            });
            ciePinBottomSheet.present();
          }}
          badge={!isReissuanceMode ? badgeProps : undefined}
        />
        {ciePinBottomSheet.bottomSheet}
      </>
    );
  }

  return (
    <ModuleNavigationAlt
      testID="CiePinMethodModuleTestIDL2"
      title={I18n.t(
        `${translationKey}${isReissuanceMode ? ".title.l3" : ".title.default"}`
      )}
      subtitle={I18n.t(`${translationKey}.subtitle.default`)}
      icon="fiscalCodeIndividual"
      onPress={handleOnPress}
    />
  );
};
