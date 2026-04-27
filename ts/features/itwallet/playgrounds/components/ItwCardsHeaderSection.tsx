import {
  IOVisualCostants,
  ListItemHeader,
  VStack
} from "@pagopa/io-app-design-system";
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

/**
 * Detail Cards section for ITW Playground.
 * Shows ItwCredentialDetailCard for each credential type and status.
 */
export const ItwCardsHeaderSection = () => (
  <VStack space={24}>
    {ALL_CREDENTIAL_TYPES.map(credentialType => (
      <View key={credentialType}>
        <ListItemHeader label={getCredentialNameFromType(credentialType)} />
        <View style={{ marginHorizontal: -IOVisualCostants.appMarginDefault }}>
          <ItwCredentialDetailCard credentialType={credentialType}>
            <View style={{ height: 200 }} />
          </ItwCredentialDetailCard>
        </View>
      </View>
    ))}
  </VStack>
);
