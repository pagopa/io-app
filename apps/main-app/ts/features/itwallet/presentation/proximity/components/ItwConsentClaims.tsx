import { VStack } from "@io-app/design-system";
import { useMemo } from "react";
import { View } from "react-native";

import { useIOSelector } from "../../../../../store/hooks";
import {
  ClaimDisplayFormat,
  parseClaims
} from "../../../common/utils/itwClaimsUtils";
import {
  CredentialFormat,
  CredentialMetadata
} from "../../../common/utils/itwTypesUtils";
import { makeSelectAllCredentials } from "../../../credentials/store/selectors";
import { ItwClaimsSelector } from "../../common/components/ItwClaimsSelector";
import { StoredConsentData } from "../store/types";

type Props = {
  consent: StoredConsentData;
};

const itwMdocCredentialsByTypeSelector = makeSelectAllCredentials(
  CredentialFormat.MDOC
);

/**
 * Resolves only the current mdoc claims covered by a stored consent.
 */
export const getConsentClaimsByCredential = (
  consent: StoredConsentData,
  credentialsByType: Partial<Record<string, CredentialMetadata>>
) =>
  consent.credentials.flatMap(({ claimNames, credentialType }) => {
    const credential = credentialsByType[credentialType];
    if (!credential) {
      return [];
    }

    const requestedClaims = Object.fromEntries(
      Object.entries(credential.parsedCredential).filter(([claimName]) =>
        claimNames.includes(claimName)
      )
    );

    const claims = parseClaims(requestedClaims);
    return claims.length > 0 ? [{ claims, credentialType }] : [];
  });

/**
 * Renders the current values associated with the mdoc claim identifiers stored
 * in the consent. Missing credentials and claims are ignored safely because a
 * credential can be removed while this screen is mounted.
 */
export const ItwConsentClaims = ({ consent }: Props) => {
  const credentialsByType = useIOSelector(itwMdocCredentialsByTypeSelector);

  const claimsByCredential = useMemo(
    () => getConsentClaimsByCredential(consent, credentialsByType),
    [consent, credentialsByType]
  );

  return (
    <View testID="consent-claims">
      <VStack space={24}>
        {claimsByCredential.map(({ claims, credentialType }, index) => (
          <ItwClaimsSelector
            credentialType={credentialType}
            defaultExpanded
            items={claims as Array<ClaimDisplayFormat>}
            key={`${credentialType}-${index}`}
            selectionEnabled={false}
          />
        ))}
      </VStack>
    </View>
  );
};
