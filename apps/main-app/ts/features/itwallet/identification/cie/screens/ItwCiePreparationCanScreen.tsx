import { useFocusEffect } from "@react-navigation/native";
import I18n from "i18next";
import { useCallback } from "react";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { selectIdentification } from "../../../machine/eid/selectors";
import { trackItwIdCieCanTutorialCan } from "../../analytics";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";

export const ItwCiePreparationCanScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const identification =
    ItwEidIssuanceMachineContext.useSelector(selectIdentification);

  useFocusEffect(
    useCallback(() => {
      trackItwIdCieCanTutorialCan({ ITW_ID_method: identification?.mode });
    }, [identification])
  );

  const dismissalDialog = useItwDismissalDialog({
    customLabels: {
      title: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.title"
      ),
      body: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.body"
      ),
      confirmLabel: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.confirm"
      ),
      cancelLabel: I18n.t(
        "features.itWallet.discovery.screen.itw.dismissalDialog.cancel"
      )
    },
    handleDismiss: () => {
      machineRef.send({ type: "close" });
    }
  });

  return (
    <ItwCiePreparationScreenContent
      title={I18n.t(`features.itWallet.identification.cie.prepare.can.title`)}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.can.description`
      )}
      imageSrc={require("../../../../../../img/features/itWallet/identification/cie_can.png")}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(`features.itWallet.identification.cie.prepare.can.cta`),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
      goBack={dismissalDialog.show}
    />
  );
};
