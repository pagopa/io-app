import {
  Avatar,
  H6,
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  VSpacer
} from "@pagopa/io-app-design-system";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { WithTestID } from "../../../../types/WithTestID";
import { logoForInstitution } from "../utils";

export type FeaturedInstitutionCardProps = WithTestID<{
  id: string;
  name: string;
  accessibilityLabel?: string;
  isNew?: boolean;
  onPress?: (id: string) => void;
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
  <View
    style={[styles.cardContainer, props.isNew && styles.cardContainerNew]}
    testID={props.testID}
  >
    <View style={styles.cardContent}>
      <View style={styles.cardAvatar}>
        <Avatar
          logoUri={logoForInstitution({
            id: "",
            name: "",
            fiscal_code: props.id as OrganizationFiscalCode
          })}
          size="small"
        />
      </View>
      <View style={styles.cardLabel}>
        <H6 lineBreakMode="head" numberOfLines={2} color="hanPurple-850">
          {props.name}
        </H6>
      </View>
    </View>
  </View>
);

const FeaturedInstitutionCardSkeleton = ({ testID }: WithTestID<unknown>) => (
  <View style={styles.cardContainer} testID={`${testID}-skeleton`}>
    <View style={styles.cardContent}>
      <View style={styles.cardAvatar}>
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width={44}
          height={44}
        />
      </View>
      <View style={styles.cardLabel}>
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width="70%"
          height={16}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width="55%"
          height={16}
        />
      </View>
    </View>
  </View>
);

export { FeaturedInstitutionCard, FeaturedInstitutionCardSkeleton };
