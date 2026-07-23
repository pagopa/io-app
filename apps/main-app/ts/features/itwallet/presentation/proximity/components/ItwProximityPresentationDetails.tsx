import { VStack } from "@io-app/design-system";
import { memo } from "react";
import { View } from "react-native";

import { ItwClaimsSelector } from "../../common/components/ItwClaimsSelector";
import { ProximityDetails } from "../utils/types";

type ItwProximityPresentationDetailsProps = {
  data: ProximityDetails;
};

const ItwProximityPresentationDetails = ({
  data
}: ItwProximityPresentationDetailsProps) => (
  <View>
    <VStack space={24}>
      {data.map(({ claimsToDisplay, credentialType }) => (
        <ItwClaimsSelector
          credentialType={credentialType}
          defaultExpanded
          items={claimsToDisplay}
          key={credentialType}
          selectionEnabled={false}
        />
      ))}
    </VStack>
  </View>
);

const MemoizedItwProximityPresentationDetails = memo(
  ItwProximityPresentationDetails
);

export { MemoizedItwProximityPresentationDetails as ItwProximityPresentationDetails };
