import {
  HStack,
  IOVisualCostants,
  ListItemHeader,
  VStack
} from "@pagopa/io-app-design-system";
import { ScrollView, View } from "react-native";
import { DSComponentViewerBox } from "../../../design-system/components/DSComponentViewerBox";
import { ItwCredentialCard } from "../../common/components/ItwCredentialCard";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { ItwCredentialStatus } from "../../common/utils/itwTypesUtils";
import { ItwCredentialWalletCard } from "../../wallet/components/ItwCredentialWalletCard";

const ALL_CREDENTIAL_STATUSES: ReadonlyArray<ItwCredentialStatus> = [
  "valid",
  "expiring",
  "expired",
  "jwtExpiring",
  "jwtExpired",
  "invalid",
  "unknown"
];

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
 * Cards section for ITW Playground
 * @returns cards section displaying ID card components
 */
export const ItwCardsSection = () => (
  <VStack space={8}>
    {ALL_CREDENTIAL_TYPES.map(credentialType => (
      <View key={credentialType}>
        <ListItemHeader label={getCredentialNameFromType(credentialType)} />
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={{
            aspectRatio: 15 / 9,
            marginHorizontal: -IOVisualCostants.appMarginDefault
          }}
          contentContainerStyle={{
            paddingHorizontal: IOVisualCostants.appMarginDefault,
            paddingTop: 8,
            paddingBottom: 24
          }}
        >
          <HStack space={8}>
            {ALL_CREDENTIAL_STATUSES.map(status => (
              <DSComponentViewerBox key={status} name={status}>
                <ItwCredentialCard
                  credentialType={credentialType}
                  credentialStatus={status}
                />
              </DSComponentViewerBox>
            ))}
          </HStack>
        </ScrollView>
      </View>
    ))}
    <View style={{ paddingBottom: 200 }}>
      <ListItemHeader label={"Stack"} />
      {ALL_CREDENTIAL_TYPES.map(credentialType => (
        <ItwCredentialWalletCard
          key={credentialType}
          cardProps={{ credentialType }}
          isStacked
        />
      ))}
    </View>
  </VStack>
);
