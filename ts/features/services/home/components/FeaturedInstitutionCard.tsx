import {
  Avatar,
  H6,
  IOColors,
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

const styles = StyleSheet.create({
  cardBaseContainer: {
    height: 72,
    width: CARD_WIDTH,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
    backgroundColor: IOColors["grey-50"]
  },
  cardContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardContainerNew: {
    borderColor: IOColors["hanPurple-100"],
    backgroundColor: IOColors["hanPurple-50"]
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%"
  },
  cardContentRight: {
    marginLeft: 8,
    alignSelf: "center",
    alignItems: "flex-start",
    flexWrap: "wrap",
    width: "80%"
  }
});

const FeaturedInstitutionCard = (props: FeaturedInstitutionCardProps) => (
  <View
    style={[
      styles.cardBaseContainer,
      styles.cardContainer,
      props.isNew && styles.cardContainerNew
    ]}
    testID={props.testID}
  >
    <View style={styles.cardContent}>
      <View>
        <Avatar
          logoUri={logoForInstitution({
            id: "",
            name: "",
            fiscal_code: props.id as OrganizationFiscalCode
          })}
          size="small"
        />
      </View>
      <View style={styles.cardContentRight}>
        <H6 lineBreakMode="head" numberOfLines={2} color="hanPurple-850">
          {props.name}
        </H6>
      </View>
    </View>
  </View>
);

const FeaturedInstitutionCardSkeleton = ({ testID }: WithTestID<unknown>) => (
  <View
    style={[styles.cardBaseContainer, styles.cardContainer]}
    testID={`${testID}-skeleton`}
  >
    <View style={styles.cardContent}>
      <View>
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width={44}
          height={44}
        />
      </View>
      <View style={styles.cardContentRight}>
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width={200}
          height={16}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          color={IOColors["grey-200"]}
          animate="fade"
          radius={8}
          width={150}
          height={16}
        />
      </View>
    </View>
  </View>
);

export { FeaturedInstitutionCard, FeaturedInstitutionCardSkeleton };
