import I18n from "i18next";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { ItwCiePreparationScreenContent } from "../components/ItwCiePreparationScreenContent";

export const ItwCiePreparationCanScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

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
    />
  );
};
