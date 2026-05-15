import { ClaimsSelector, VStack } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { View } from "react-native";
import { useIOSelector } from "../../../../../store/hooks";
import { itwCredentialNameResolverSelector } from "../../../credentialsCatalogue/store/selectors";
import { useClaimsDetailsBottomSheet } from "../../common/hooks/useClaimsDetailsBottomSheet";
import {
  claimsSelectorHeaderGradientsByCredentialType,
  mapClaimsToClaimsSelectorItems
} from "../../common/utils/itwClaimSelector";
import { ProximityDetails } from "../utils/types";

type ItwProximityPresentationDetailsProps = {
  data: ProximityDetails;
};

const ItwProximityPresentationDetails = ({
  data
}: ItwProximityPresentationDetailsProps) => {
  const { present, bottomSheet } = useClaimsDetailsBottomSheet();
  const resolveCredentialName = useIOSelector(
    itwCredentialNameResolverSelector
  );

  return (
    <View>
      <VStack space={24}>
        {data.map(({ claimsToDisplay, credentialType }) => (
          <ClaimsSelector
            key={credentialType}
            title={resolveCredentialName(credentialType)}
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
