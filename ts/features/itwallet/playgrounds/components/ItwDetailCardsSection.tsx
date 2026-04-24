import { IOText, ListItemHeader, VStack } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { ItwCredentialDetailCard } from "../../common/components/ItwCredentialDetailCard";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";

const ALL_CREDENTIAL_TYPES: ReadonlyArray<string> = [
  CredentialType.PID,
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
  CredentialType.EDUCATION_ATTENDANCE,
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_DIPLOMA,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY,
  "Unknown Credential",
  "Unknown Credential Type with Ridicolously Long Long Long Long Name"
];

const PlaceholderContent = () => (
  <View style={{ paddingVertical: 24, alignItems: "center" }}>
    <IOText>{"Credential content"}</IOText>
  </View>
);

/**
 * Detail Cards section for ITW Playground.
 * Shows ItwCredentialDetailCard for each credential type and status.
 */
export const ItwDetailCardsSection = () => (
  <VStack space={24}>
    {ALL_CREDENTIAL_TYPES.map(credentialType => (
      <View key={credentialType}>
        <ListItemHeader label={getCredentialNameFromType(credentialType)} />
        <VStack space={16}>
          <ItwCredentialDetailCard credentialType={credentialType}>
            <PlaceholderContent />
          </ItwCredentialDetailCard>
        </VStack>
      </View>
    ))}
  </VStack>
);
