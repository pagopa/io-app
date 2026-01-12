import I18n from "i18next";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";
import { ItwIssuanceUpdateCredentialsScreenContent } from "../components/ItwIssuanceUpdateCredentialsScreenContent";

export const ItwIssuanceUpdateCredentialsScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  return (
    <ItwIssuanceUpdateCredentialsScreenContent
      // TODO: change pictogram once available
      pictogram="activate"
      title={I18n.t(`features.itWallet.identification.updateCredential.title`)}
      subtitle={I18n.t(
        `features.itWallet.identification.updateCredential.description`
      )}
      action={{
        label: I18n.t(
          `features.itWallet.identification.updateCredential.button`
        ),
        onPress: () => machineRef.send({ type: "add-to-wallet" })
      }}
    />
  );
};
