import {
  ClaimsSelector,
  ListItemHeader,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo } from "react";
import { View } from "react-native";

import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { useClaimsDetailsBottomSheet } from "../../common/hooks/useClaimsDetailsBottomSheet";
import {
  claimsSelectorHeaderGradientsByCredentialType,
  mapClaimsToClaimsSelectorItems
} from "../../common/utils/itwClaimSelector";
import { ProximityDetails } from "../utils/itwProximityTypeUtils";

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
        description={I18n.t(
          "features.itWallet.presentation.proximity.selectiveDisclosure.purpose"
        )}
        iconColor={theme["icon-decorative"]}
        iconName="security"
        label={I18n.t(
          "features.itWallet.presentation.proximity.selectiveDisclosure.requiredClaims"
        )}
      />
      <VStack space={24}>
        {data.map(({ claimsToDisplay, credentialType }) => (
          <ClaimsSelector
            defaultExpanded
            headerGradientColors={
              claimsSelectorHeaderGradientsByCredentialType[credentialType]
            }
            items={mapClaimsToClaimsSelectorItems(claimsToDisplay, present)}
            key={credentialType}
            selectionEnabled={false}
            title={getCredentialNameFromType(credentialType)}
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
