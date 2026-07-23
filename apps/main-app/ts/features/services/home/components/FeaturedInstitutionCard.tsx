import {
  Avatar,
  H6,
  IOSkeleton,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer
} from "@io-app/design-system";
import { Dimensions, StyleSheet, View } from "react-native";

import { WithTestID } from "../../../../types/WithTestID";
import { CardPressableBase } from "../../common/components/CardPressableBase";
import { getLogoForInstitution } from "../../common/utils";
import { useServiceCardStyle } from "../hooks/useServiceCardStyle";

export type FeaturedInstitutionCardProps = WithTestID<{
  accessibilityLabel?: string;
  id: string;
  isNew?: boolean;
  name: string;
  onPress?: () => void;
}>;

export const CARD_WIDTH =
  Dimensions.get("window").width - IOVisualCostants.appMarginDefault * 2;

const cardPaddingHorizontal: IOSpacingScale = 12;
const cardBorderRadius = 8;
const cardAvatarMargin: IOSpacingScale = 8;

const styles = StyleSheet.create({
  cardContainer: {
    height: 72,
    width: CARD_WIDTH,
    paddingHorizontal: cardPaddingHorizontal,
    borderRadius: cardBorderRadius,
    borderCurve: "continuous",
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center"
  },
  cardAvatar: {
    marginRight: cardAvatarMargin
  },
  cardLabel: {
    flexGrow: 1,
    flexShrink: 1
  }
});

const FeaturedInstitutionCard = ({
  id,
  name,
  accessibilityLabel,
  isNew,
  onPress,
  testID
}: FeaturedInstitutionCardProps) => {
  const { default: defaultThemeStyle, new: newThemeStyle } =
    useServiceCardStyle();

  return (
    <CardPressableBase
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={`${testID}-pressable`}
    >
      <View
        style={[
          styles.cardContainer,
          defaultThemeStyle.card,
          isNew && newThemeStyle.card
        ]}
        testID={testID}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardAvatar}>
            <Avatar logoUri={getLogoForInstitution(id)} size="small" />
          </View>
          <View style={styles.cardLabel}>
            <H6
              color={
                isNew
                  ? newThemeStyle.foreground.primary
                  : defaultThemeStyle.foreground.primary
              }
              numberOfLines={2}
            >
              {name}
            </H6>
          </View>
        </View>
      </View>
    </CardPressableBase>
  );
};

const FeaturedInstitutionCardSkeleton = ({ testID }: WithTestID<unknown>) => {
  const { default: defaultThemeStyle, skeletonColor } = useServiceCardStyle();

  return (
    <View
      style={[styles.cardContainer, defaultThemeStyle.card]}
      testID={`${testID}-skeleton`}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardAvatar}>
          <IOSkeleton
            color={skeletonColor}
            radius={IOVisualCostants.avatarRadiusSizeSmall}
            shape="square"
            size={IOVisualCostants.avatarSizeSmall}
          />
        </View>
        <View style={styles.cardLabel}>
          <IOSkeleton
            color={skeletonColor}
            height={16}
            radius={8}
            shape="rectangle"
            width="70%"
          />
          <VSpacer size={8} />
          <IOSkeleton
            color={skeletonColor}
            height={16}
            radius={8}
            shape="rectangle"
            width="55%"
          />
        </View>
      </View>
    </View>
  );
};

export { FeaturedInstitutionCard, FeaturedInstitutionCardSkeleton };
