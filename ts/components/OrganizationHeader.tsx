import { Col, Grid } from "native-base";
import * as React from "react";
import { ImageURISource, StyleSheet } from "react-native";
import { MultiImage } from "./ui/MultiImage";
import { H2 } from "./core/typography/H2";
import { Body } from "./core/typography/Body";

const styles = StyleSheet.create({
  serviceCol: {
    width: 60
  },
  serviceMultiImage: {
    width: 60,
    height: 60
  },
  leftColumnStyle: { marginRight: 16 }
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
  <Grid>
    <Col style={styles.leftColumnStyle}>
      <H2>{organizationName}</H2>
      <Body>{serviceName}</Body>
    </Col>
    <Col style={styles.serviceCol}>
      <MultiImage style={styles.serviceMultiImage} source={logoURLs} />
    </Col>
  </Grid>
);

export default OrganizationHeader;
