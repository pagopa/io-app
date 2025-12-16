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
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { WithTestID } from "../../../../types/WithTestID";
import { CardPressableBase } from "../../common/components/CardPressableBase";
import { useServiceCardStyle } from "../hooks/useServiceCardStyle";
import { logoForService } from "../utils";

export type FeaturedServiceCardProps = WithTestID<{
  id: string;
  name: string;
  organizationName?: string;
  accessibilityLabel?: string;
  isNew?: boolean;
  onPress?: () => void;
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
        <View style={styles.cardHeader}>
          <Avatar logoUri={logoForService(id, "")} size="medium" />
          {isNew && <Badge variant="cgn" text={I18n.t("services.new")} />}
        </View>
        <View style={styles.cardTitle}>
          <H4
            lineBreakMode="head"
            numberOfLines={3}
            color={
              isNew
                ? newThemeStyle.foreground.primary
                : defaultThemeStyle.foreground.primary
            }
          >
            {name}
          </H4>
          {organizationName && (
            <>
              <VSpacer size={4} />
              <BodySmall
                weight="Regular"
                color={
                  isNew
                    ? newThemeStyle.foreground.secondary
                    : defaultThemeStyle.foreground.secondary
                }
                lineBreakMode="head"
                numberOfLines={1}
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
          shape="square"
          size={IOVisualCostants.avatarSizeMedium}
          radius={IOVisualCostants.avatarRadiusSizeMedium}
        />
      </View>
      <View style={styles.cardTitle}>
        <IOSkeleton
          color={skeletonColor}
          shape="rectangle"
          width={"100%"}
          height={16}
          radius={8}
        />
        <View style={{ marginTop: 10 }}>
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            width={"70%"}
            height={16}
            radius={8}
          />
        </View>
        <View style={{ marginTop: 10 }}>
          <IOSkeleton
            color={skeletonColor}
            shape="rectangle"
            width={"100%"}
            height={8}
            radius={8}
          />
        </View>
      </View>
    </View>
  );
};

export { FeaturedServiceCard, FeaturedServiceCardSkeleton };
