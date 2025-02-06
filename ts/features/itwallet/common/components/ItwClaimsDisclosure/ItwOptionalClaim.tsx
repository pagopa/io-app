import { Pressable, View } from "react-native";
import Animated from "react-native-reanimated";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import {
  AnimatedCheckbox,
  BodySmall,
  IOSelectionListItemStyles,
  IOStyles,
  useListItemAnimation
} from "@pagopa/io-app-design-system";
import I18n from "../../../../../i18n";
import { ClaimDisplayFormat } from "../../utils/itwClaimsUtils";
import { ItwStaticClaim } from "./ItwStaticClaim";
import { ClaimText } from "./ItwClaimText";

type ItwOptionalClaimProps = {
  claim: ClaimDisplayFormat;
  source: string;
  checked: boolean;
  unavailable: boolean;
  onPress: (claimId: string) => void;
};

/**
 * Claim with a pressable checkbox, customized from `ListItemCheckbox`.
 */
export const ItwOptionalClaim = ({
  claim,
  source,
  checked,
  onPress,
  unavailable
}: ItwOptionalClaimProps) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  const handleOnPress = () => {
    ReactNativeHapticFeedback.trigger("impactLight");
    onPress(claim.id);
  };

  if (unavailable) {
    return <ItwStaticClaim claim={claim} source={source} unavailable />;
  }

  return (
    <Pressable
      onPress={handleOnPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onTouchEnd={onPressOut}
      testID={`ClaimCheckbox_${claim.id}`}
      accessibilityRole="checkbox"
      accessible={true}
      accessibilityState={{ checked }}
    >
      <Animated.View
        style={[IOSelectionListItemStyles.listItem, backgroundAnimatedStyle]}
        // This is required to avoid opacity inheritance on Android
        needsOffscreenAlphaCompositing={true}
      >
        <Animated.View
          style={[scaleAnimatedStyle, IOStyles.row, IOStyles.alignCenter]}
        >
          <View style={{ marginRight: "auto" }}>
            <ClaimText claim={claim} />
            <BodySmall weight="Regular" color="grey-700">
              {I18n.t("features.itWallet.generic.dataSource.single", {
                credentialSource: source
              })}
            </BodySmall>
          </View>
          <View
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <AnimatedCheckbox checked={checked} size={24} />
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};
