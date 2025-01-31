import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import I18n from "../../../../../i18n.ts";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";
import { ItwCredentialIssuanceMachineContext } from "../../../machine/provider.tsx";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";

type Props = {
  credential: StoredCredential;
};

export const ItwPresentationCredentialVerificationExpired = ({
  credential
}: Props) => {
  const navigation = useIONavigation();
  const machineRef = ItwCredentialIssuanceMachineContext.useActorRef();

  useHeaderSecondLevel({
    title: "",
    headerShown: false
  });

  const beginCredentialIssuance = () => {
    machineRef.send({
      type: "select-credential",
      credentialType: credential.credentialType
    });
  };

  return (
    <OperationResultScreenContent
      pictogram="identityRefresh"
      title={I18n.t(
        "features.itWallet.presentation.credentialDetails.verificationExpired.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.credentialDetails.verificationExpired.content",
        {
          credentialName: getCredentialNameFromType(credential.credentialType)
        }
      )}
      action={{
        label: I18n.t(
          "features.itWallet.presentation.credentialDetails.verificationExpired.primaryAction"
        ),
        onPress: beginCredentialIssuance
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.close"),
        onPress: () => navigation.goBack()
      }}
    />
  );
};
