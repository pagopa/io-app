import {
  Avatar,
  H6,
  IOSkeleton,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Dimensions, StyleSheet, View } from "react-native";
import { WithTestID } from "../../../../types/WithTestID";
import { CardPressableBase } from "../../common/components/CardPressableBase";
import { getLogoForInstitution } from "../../common/utils";
import { useServiceCardStyle } from "../hooks/useServiceCardStyle";

export type FeaturedInstitutionCardProps = WithTestID<{
  id: string;
  name: string;
  accessibilityLabel?: string;
  isNew?: boolean;
  onPress?: () => void;
}>;

export const CARD_WIDTH =
  Dimensions.get("window").width - IOVisualCostants.appMarginDefault * 2;

const cardPaddingHorizontal: IOSpacingScale = 12;
const cardBorderRadius: number = 8;
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
      onPress={onPress}
      testID={`${testID}-pressable`}
      accessibilityLabel={accessibilityLabel}
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
              lineBreakMode="head"
              numberOfLines={2}
              color={
                isNew
                  ? newThemeStyle.foreground.primary
                  : defaultThemeStyle.foreground.primary
              }
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
            shape="square"
            radius={IOVisualCostants.avatarRadiusSizeSmall}
            size={IOVisualCostants.avatarSizeSmall}
          />
        </View>
        <View style={styles.cardLabel}>
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            radius={8}
            width="70%"
            height={16}
          />
          <VSpacer size={8} />
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            radius={8}
            width="55%"
            height={16}
          />
        </View>
      </View>
    </View>
  );
};

export { FeaturedInstitutionCard, FeaturedInstitutionCardSkeleton };
