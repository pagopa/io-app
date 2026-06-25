import I18n from "i18next";

import { IOScrollViewCentredContent } from "../../../../components/ui/IOScrollViewCentredContent";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import { ItwEidIssuanceMachineContext } from "../../machine/eid/provider";

export const ItwIssuanceUpgradeCredentialsScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  useHeaderSecondLevel({
    supportRequest: true,
    title: ""
  });

  return (
    <IOScrollViewCentredContent
      actions={{
        type: "SingleButton",
        primary: {
          color: "primary",
          label: I18n.t(
            `features.itWallet.identification.updateCredential.button`
          ),
          onPress: () => machineRef.send({ type: "next" })
        }
      }}
      description={I18n.t(
        `features.itWallet.identification.updateCredential.description`
      )}
      pictogram={"premiumCredentials"}
      title={I18n.t(`features.itWallet.identification.updateCredential.title`)}
    />
  );
};
