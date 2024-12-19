import React from "react";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

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
