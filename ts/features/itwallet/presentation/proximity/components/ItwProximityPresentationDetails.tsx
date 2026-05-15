import {
  ListItemHeader,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo } from "react";
import { View } from "react-native";
import { ItwClaimsSelector } from "../../common/components/ItwClaimsSelector";
import { ProximityDetails } from "../utils/itwProximityTypeUtils";

type ItwProximityPresentationDetailsProps = {
  data: ProximityDetails;
};

const ItwProximityPresentationDetails = ({
  data
}: ItwProximityPresentationDetailsProps) => {
  const theme = useIOTheme();

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
          <ItwClaimsSelector
            key={credentialType}
            credentialType={credentialType}
            items={claimsToDisplay}
            defaultExpanded
            selectionEnabled={false}
          />
        ))}
      </VStack>
    </View>
  );
};

const MemoizedItwProximityPresentationDetails = memo(
  ItwProximityPresentationDetails
);

export { MemoizedItwProximityPresentationDetails as ItwProximityPresentationDetails };
