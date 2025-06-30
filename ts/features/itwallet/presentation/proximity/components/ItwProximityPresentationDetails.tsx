import { ComponentProps, memo } from "react";
import { View } from "react-native";
import {
  ClaimsSelector,
  ListItemHeader,
  VStack,
  useIOTheme
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import {
  ClaimDisplayFormat,
  ImageClaim,
  getClaimDisplayValue,
  getSafeText
} from "../../../common/utils/itwClaimsUtils";
import { getCredentialNameFromType } from "../../../common/utils/itwCredentialUtils";
import { ProximityDetails } from "../utils/itwProximityTypeUtils";

const mapClaims = (
  claims: Array<ClaimDisplayFormat>
): ComponentProps<typeof ClaimsSelector>["items"] =>
  claims.map(c => {
    const displayValue = getClaimDisplayValue(c);
    if (ImageClaim.is(displayValue)) {
      return {
        id: c.id,
        value: displayValue,
        description: c.label,
        type: "image"
      };
    }
    return {
      id: c.id,
      value: Array.isArray(displayValue)
        ? displayValue.map(getSafeText).join(", ")
        : getSafeText(displayValue),
      description: c.label
    };
  });

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
          <ClaimsSelector
            key={credentialType}
            title={getCredentialNameFromType(credentialType)}
            items={mapClaims(claimsToDisplay)}
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
