import I18n from "i18next";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ItwIssuanceUpgradeCredentialsScreenContent } from "../components/ItwIssuanceUpgradeCredentialsScreenContent";

export const ItwIssuanceUpgradeCredentialsScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  return (
    <ItwIssuanceUpgradeCredentialsScreenContent
      pictogram="premiumCredentials"
      title={I18n.t(`features.itWallet.identification.upgradeCredential.title`)}
      subtitle={I18n.t(
        `features.itWallet.identification.upgradeCredential.description`
      )}
      action={{
        label: I18n.t(
          `features.itWallet.identification.upgradeCredential.button`
        ),
        onPress: () => machineRef.send({ type: "add-to-wallet" })
      }}
    />
  );
};
