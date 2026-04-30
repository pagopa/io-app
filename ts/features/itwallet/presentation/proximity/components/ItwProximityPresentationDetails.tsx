import {
  ClaimsSelector,
  ListItemHeader,
  VStack,
  useIOThemeContext
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo } from "react";
import { View } from "react-native";
import { getCredentialCardConfig } from "../../../common/components/ItwCredentialCard/config";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { useItWalletTheme } from "../../../common/utils/theme";
import { useClaimsDetailsBottomSheet } from "../../common/hooks/useClaimsDetailsBottomSheet";
import { mapClaimsToClaimsSelectorItems } from "../../common/utils/itwClaimSelector";
import { ProximityDetails } from "../utils/itwProximityTypeUtils";

type ItwProximityPresentationDetailsProps = {
  data: ProximityDetails;
};

const ItwProximityPresentationDetails = ({
  data
}: ItwProximityPresentationDetailsProps) => {
  const { theme, themeType } = useIOThemeContext();
  const itwTheme = useItWalletTheme();
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
        {data.map(({ claimsToDisplay, credentialType }) => {
          const config = getCredentialCardConfig(credentialType, themeType);

          return (
            <ClaimsSelector
              key={credentialType}
              title={getCredentialNameFromType(credentialType)}
              items={mapClaimsToClaimsSelectorItems(claimsToDisplay, present)}
              defaultExpanded
              selectionEnabled={false}
              headerGradientColors={[itwTheme["card-background"], config.color]}
            />
          );
        })}
        {bottomSheet}
      </VStack>
    </View>
  );
};

const MemoizedItwProximityPresentationDetails = memo(
  ItwProximityPresentationDetails
);

export { MemoizedItwProximityPresentationDetails as ItwProximityPresentationDetails };
