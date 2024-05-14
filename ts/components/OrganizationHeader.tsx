import * as React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import { Body, H3, IOStyles } from "@pagopa/io-app-design-system";
import { MultiImage } from "./ui/MultiImage";

const styles = StyleSheet.create({
  serviceMultiImage: {
    width: 60,
    height: 60
  }
});

type Props = {
  serviceName: string;
  organizationName: string;
  logoURLs: ReadonlyArray<ImageURISource>;
};

/**
 * A component to render the name of the organization and of the related service
 * with the corresponding image
 */
const OrganizationHeader = ({
  serviceName,
  organizationName,
  logoURLs
}: Props) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between"
    }}
  >
    <View style={IOStyles.flex}>
      <H3>{organizationName}</H3>
      <Body>{serviceName}</Body>
    </View>
    <View>
      <MultiImage style={styles.serviceMultiImage} source={logoURLs} />
    </View>
  </View>
);

export default OrganizationHeader;
