import {
  Avatar,
  Badge,
  H4,
  IOColors,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import I18n from "../../../../i18n";
import { WithTestID } from "../../../../types/WithTestID";
import { logoForService } from "../utils";
import OrganizationNameLabel from "./OrganizationNameLabel";

export type FeaturedServiceCardProps = WithTestID<{
  id: string;
  name: string;
  organization_name?: string;
  accessibilityLabel?: string;
  isNew?: boolean;
  onPress?: () => void;
}>;

const styles = StyleSheet.create({
  cardBaseContainer: {
    height: 210,
    width: 210,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: IOColors["grey-100"],
    backgroundColor: IOColors["grey-50"]
  },
  cardContainer: {
    flex: 1,
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
    alignItems: "center",
    width: "100%"
  },
  cardHeaderRight: {
    alignSelf: "flex-start"
  },
  cardTitle: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  }
});

const FeaturedServiceCard = (props: FeaturedServiceCardProps) => (
  <View
    style={[
      styles.cardBaseContainer,
      styles.cardContainer,
      props.isNew && styles.cardContainerNew
    ]}
    testID={props.testID}
  >
    <View style={styles.cardHeader}>
      <View>
        <Avatar logoUri={logoForService(props.id, "")} size="small" />
      </View>
      {props.isNew && (
        <View style={styles.cardHeaderRight}>
          <Badge variant="purple" text={I18n.t("services.new")} />
        </View>
      )}
    </View>
    <View style={styles.cardTitle}>
      <H4 lineBreakMode="head" numberOfLines={3} color="hanPurple-850">
        {props.name}
      </H4>
    </View>
    <VSpacer size={4} />
    {props.organization_name && (
      <OrganizationNameLabel>{props.organization_name}</OrganizationNameLabel>
    )}
  </View>
);

const FeaturedServiceCardSkeleton = ({ testID }: WithTestID<unknown>) => (
  <View style={styles.cardBaseContainer} testID={`${testID}-skeleton`}>
    <Placeholder.Box
      color={IOColors["grey-200"]}
      animate="fade"
      radius={8}
      width={56}
      height={56}
    />
    <View style={{ marginTop: 62 }}>
      <Placeholder.Box
        color={IOColors["grey-200"]}
        animate="fade"
        radius={8}
        width={"100%"}
        height={16}
      />
    </View>
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
);

export { FeaturedServiceCard, FeaturedServiceCardSkeleton };
