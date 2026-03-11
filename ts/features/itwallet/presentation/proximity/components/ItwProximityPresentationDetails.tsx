import { memo } from "react";
import { View } from "react-native";
import {
  ClaimsSelector,
  ListItemHeader,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { ProximityDetails } from "../utils/itwProximityTypeUtils";
import {
  claimsSelectorHeaderGradientsByCredentialType,
  mapClaimsToClaimsSelectorItems
} from "../../common/utils/itwClaimSelector";
import { useClaimsDetailsBottomSheet } from "../../common/hooks/useClaimsDetailsBottomSheet";

type ItwProximityPresentationDetailsProps = {
  data: ProximityDetails;
};

const ItwProximityPresentationDetails = ({
  data
}: ItwProximityPresentationDetailsProps) => {
  const theme = useIOTheme();
  const { present, bottomSheet } = useClaimsDetailsBottomSheet();

  return (
    <View>
      <ListItemHeader
        label={I18n.t(
          "features.itWallet.presentation.proximity.selectiveDisclosure.requiredClaims"
        )}
        iconName="security"
        iconColor={theme["icon-decorative"]}
        description={I18n.t(
          "features.itWallet.presentation.proximity.selectiveDisclosure.purpose"
        )}
      />
      <VStack space={24}>
        {data.map(({ claimsToDisplay, credentialType }) => (
          <ClaimsSelector
            key={credentialType}
            title={getCredentialNameFromType(credentialType)}
            items={mapClaimsToClaimsSelectorItems(claimsToDisplay, present)}
            defaultExpanded
            selectionEnabled={false}
            headerGradientColors={
              claimsSelectorHeaderGradientsByCredentialType[credentialType]
            }
          />
        ))}
        {bottomSheet}
      </VStack>
    </View>
  );
};

const MemoizedItwProximityPresentationDetails = memo(
  ItwProximityPresentationDetails
);

export { MemoizedItwProximityPresentationDetails as ItwProximityPresentationDetails };
