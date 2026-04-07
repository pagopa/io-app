import {
  Avatar,
  Badge,
  BodySmall,
  H4,
  IOSkeleton,
  IOSpacingScale,
  IOVisualCostants,
  TestID,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { WithTestID } from "../../../../types/WithTestID";
import { CardPressableBase } from "../../common/components/CardPressableBase";
import { useServiceCardStyle } from "../hooks/useServiceCardStyle";
import { logoForService } from "../utils";

export type FeaturedServiceCardProps = WithTestID<{
  accessibilityLabel?: string;
  id: string;
  isNew?: boolean;
  name: string;
  onPress?: () => void;
  organizationName?: string;
}>;

export const CARD_WIDTH = 210;

const cardPadding: IOSpacingScale = 16;
const cardBorderRadius: number = 8;
/* Space between the `Avatar` and the content below */
const cardSafeInnerSpace: IOSpacingScale = 16;

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    width: CARD_WIDTH,
    padding: cardPadding,
    borderRadius: cardBorderRadius,
    borderCurve: "continuous",
    borderWidth: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%"
  },
  cardTitle: {
    width: "100%",
    marginTop: cardSafeInnerSpace
  }
});

const FeaturedServiceCard = ({
  onPress,
  testID,
  accessibilityLabel,
  isNew,
  id,
  name,
  organizationName
}: FeaturedServiceCardProps) => {
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
        <View style={styles.cardHeader}>
          <Avatar logoUri={logoForService(id, "")} size="medium" />
          {isNew && <Badge text={I18n.t("services.new")} variant="cgn" />}
        </View>
        <View style={styles.cardTitle}>
          <H4
            color={
              isNew
                ? newThemeStyle.foreground.primary
                : defaultThemeStyle.foreground.primary
            }
            lineBreakMode="head"
            numberOfLines={3}
          >
            {name}
          </H4>
          {organizationName && (
            <>
              <VSpacer size={4} />
              <BodySmall
                color={
                  isNew
                    ? newThemeStyle.foreground.secondary
                    : defaultThemeStyle.foreground.secondary
                }
                lineBreakMode="head"
                numberOfLines={1}
                weight="Regular"
              >
                {organizationName}
              </BodySmall>
            </>
          )}
        </View>
      </View>
    </CardPressableBase>
  );
};

const FeaturedServiceCardSkeleton = ({ testID }: TestID) => {
  const { default: defaultThemeStyle, skeletonColor } = useServiceCardStyle();

  return (
    <View
      style={[styles.cardContainer, defaultThemeStyle.card]}
      testID={`${testID}-skeleton`}
    >
      <View style={styles.cardHeader}>
        <IOSkeleton
          color={skeletonColor}
          radius={IOVisualCostants.avatarRadiusSizeMedium}
          shape="square"
          size={IOVisualCostants.avatarSizeMedium}
        />
      </View>
      <View style={styles.cardTitle}>
        <IOSkeleton
          color={skeletonColor}
          height={16}
          radius={8}
          shape="rectangle"
          width={"100%"}
        />
        <View style={{ marginTop: 10 }}>
          <IOSkeleton
            color={skeletonColor}
            height={16}
            radius={8}
            shape="rectangle"
            width={"70%"}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <IOSkeleton
            color={skeletonColor}
            height={8}
            radius={8}
            shape="rectangle"
            width={"100%"}
          />
        </View>
      </View>
    </View>
  );
};

export { FeaturedServiceCard, FeaturedServiceCardSkeleton };
