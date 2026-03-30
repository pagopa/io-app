import I18n from "i18next";
import { useItwDismissalDialog } from "../../../common/hooks/useItwDismissalDialog";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";

export const ItwCiePreparationCardScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

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
      title={I18n.t(`features.itWallet.identification.cie.prepare.card.title`)}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.card.description`
      )}
      imageSrc={require("../../../../../../img/features/itWallet/identification/cie_card.png")}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(
            `features.itWallet.identification.cie.prepare.card.cta`
          ),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
      goBack={dismissalDialog.show}
    />
  );
};
