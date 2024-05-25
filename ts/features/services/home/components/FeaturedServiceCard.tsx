import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  Avatar,
  Badge,
  H4,
  IOColors,
  IOSpacingScale,
  IOVisualCostants,
  TestID,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { WithTestID } from "../../../../types/WithTestID";
import { CardPressableBase } from "../../common/components/CardPressableBase";
import { logoForService } from "../utils";
import OrganizationNameLabel from "./OrganizationNameLabel";

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
const cardTitleMargin: number = 8;

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    aspectRatio: 1,
    padding: cardPadding,
    borderRadius: cardBorderRadius,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
    backgroundColor: IOColors["grey-50"],
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  cardContainerNew: {
    borderColor: IOColors["hanPurple-100"],
    backgroundColor: IOColors["hanPurple-50"]
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%"
  },
  cardTitle: {
    width: "100%",
    marginTop: cardTitleMargin
  }
});

const FeaturedServiceCard = (props: FeaturedServiceCardProps) => (
  <CardPressableBase
    onPress={props.onPress}
    testID={`${props.testID}-pressable`}
    accessibilityLabel={props.accessibilityLabel}
  >
    <View
      style={[styles.cardContainer, props.isNew && styles.cardContainerNew]}
      testID={props.testID}
    >
      <View style={styles.cardHeader}>
        <Avatar logoUri={logoForService(props.id, "")} size="small" />
        {props.isNew && (
          <Badge variant="purple" text={I18n.t("services.new")} />
        )}
      </View>
      <View style={styles.cardTitle}>
        <H4
          lineBreakMode="head"
          numberOfLines={3}
          color={props.isNew ? "hanPurple-850" : "blueIO-850"}
        >
          {props.name}
        </H4>
        {props.organizationName && (
          <>
            <VSpacer size={4} />
            <OrganizationNameLabel>
              {props.organizationName}
            </OrganizationNameLabel>
          </>
        )}
      </View>
    </View>
  </CardPressableBase>
);

const FeaturedServiceCardSkeleton = ({ testID }: TestID) => (
  <View style={styles.cardContainer} testID={`${testID}-skeleton`}>
    <View style={styles.cardHeader}>
      <Placeholder.Box
        color={IOColors["grey-200"]}
        animate="fade"
        radius={8}
        width={IOVisualCostants.avatarSizeSmall}
        height={IOVisualCostants.avatarSizeSmall}
      />
    </View>
    <View style={styles.cardTitle}>
      <Placeholder.Box
        color={IOColors["grey-200"]}
        animate="fade"
        radius={8}
        width={"100%"}
        height={16}
      />
      <View style={{ marginTop: 10 }}>
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width={"70%"}
          height={16}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width={"100%"}
          height={8}
        />
      </View>
    </View>
  </View>
);

export { FeaturedServiceCard, FeaturedServiceCardSkeleton };
