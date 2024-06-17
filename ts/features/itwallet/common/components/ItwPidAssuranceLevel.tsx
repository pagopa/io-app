import React from "react";
import { Alert } from "react-native";
import { ListItemInfo } from "@pagopa/io-app-design-system";
import { SdJwt } from "@pagopa/io-react-native-wallet";
import I18n from "../../../../i18n";
import { CredentialType, mapAssuranceLevel } from "../utils/itwMocksUtils";
import { StoredCredential } from "../utils/itwTypesUtils";

type Props = {
  credential: StoredCredential;
};

/**
 * Renders the PID assurance level with an info button that currenlt navigates to a not available screen.
 * If the credential is not a PID credential, it returns null.
 * This is not part of the claims list because it's not a claim.
 * Thus it's rendered separately.
 * @returns the list item with the PID assurance level.
 */
export const ItwPidAssuranceLevel = ({
  credential: storedCredential
}: Props) => {
  const { credential, credentialType } = storedCredential;

  if (credentialType !== CredentialType.PID) {
    return null;
  }

  const { sdJwt } = SdJwt.decode(credential, SdJwt.SdJwt4VC);
  const assuranceLevel = mapAssuranceLevel(
    sdJwt.payload.verified_claims.verification.assurance_level
  );
  return (
    <ListItemInfo
      label={I18n.t(
        "features.itWallet.verifiableCredentials.claims.securityLevel"
      )}
      value={assuranceLevel}
      endElement={{
        type: "iconButton",
        componentProps: {
          icon: "info",
          onPress: () => Alert.alert("Not available"),
          accessibilityLabel: ""
        }
      }}
    />
  );
};
