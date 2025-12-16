import I18n from "i18next";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";

export const ItwCiePreparationCardScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

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
    />
  );
};
