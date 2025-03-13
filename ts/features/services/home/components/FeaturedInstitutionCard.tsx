import {
  Avatar,
  H6,
  IOColors,
  IOSkeleton,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Dimensions, StyleSheet, View } from "react-native";
import { WithTestID } from "../../../../types/WithTestID";
import { CardPressableBase } from "../../common/components/CardPressableBase";
import { getLogoForInstitution } from "../../common/utils";

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
    borderColor: IOColors["grey-100"],
    backgroundColor: IOColors["grey-50"],
    flexDirection: "row",
    alignItems: "center"
  },
  cardContainerNew: {
    borderColor: IOColors["hanPurple-100"],
    backgroundColor: IOColors["hanPurple-50"]
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

const FeaturedInstitutionCard = (props: FeaturedInstitutionCardProps) => (
  <CardPressableBase
    onPress={props.onPress}
    testID={`${props.testID}-pressable`}
    accessibilityLabel={props.accessibilityLabel}
  >
    <View
      style={[styles.cardContainer, props.isNew && styles.cardContainerNew]}
      testID={props.testID}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardAvatar}>
          <Avatar logoUri={getLogoForInstitution(props.id)} size="small" />
        </View>
        <View style={styles.cardLabel}>
          <H6 lineBreakMode="head" numberOfLines={2} color="hanPurple-850">
            {props.name}
          </H6>
        </View>
      </View>
    </View>
  </CardPressableBase>
);

const FeaturedInstitutionCardSkeleton = ({ testID }: WithTestID<unknown>) => (
  <View style={styles.cardContainer} testID={`${testID}-skeleton`}>
    <View style={styles.cardContent}>
      <View style={styles.cardAvatar}>
        <IOSkeleton
          color={IOColors["grey-200"]}
          shape="square"
          radius={IOVisualCostants.avatarRadiusSizeSmall}
          size={IOVisualCostants.avatarSizeSmall}
        />
      </View>
      <View style={styles.cardLabel}>
        <IOSkeleton
          color={IOColors["grey-200"]}
          shape="rectangle"
          radius={8}
          width="70%"
          height={16}
        />
        <VSpacer size={8} />
        <IOSkeleton
          color={IOColors["grey-200"]}
          shape="rectangle"
          radius={8}
          width="55%"
          height={16}
        />
      </View>
    </View>
  </View>
);

export { FeaturedInstitutionCard, FeaturedInstitutionCardSkeleton };
