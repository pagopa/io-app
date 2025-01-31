import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent.tsx";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel.tsx";
import I18n from "../../../../../i18n.ts";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList.ts";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils.ts";
import { StoredCredential } from "../../../common/utils/itwTypesUtils.ts";

type Props = {
  credential: StoredCredential;
};

/**
 * Rendered when it is not possible to determine the status of a credential,
 * i.e. the API call to fetch the status attestation from the issuer failed.
 */
export const ItwPresentationCredentialUnknownStatus = ({
  credential
}: Props) => {
  const navigation = useIONavigation();
  const credentialName = getCredentialNameFromType(credential.credentialType);

  useHeaderSecondLevel({
    title: "",
    headerShown: false
  });

  return (
    <OperationResultScreenContent
      pictogram="updateOS"
      title={I18n.t(
        "features.itWallet.presentation.statusAttestationUnknown.title",
        { credentialName }
      )}
      subtitle={I18n.t(
        "features.itWallet.presentation.statusAttestationUnknown.content"
      )}
      action={{
        label: I18n.t(
          "features.itWallet.presentation.statusAttestationUnknown.primaryAction"
        ),
        onPress: () => navigation.goBack()
      }}
    />
  );
};
