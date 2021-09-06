import { Col, Grid, Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../definitions/backend/ServicePublic";
import { logosForService } from "../utils/services";
import { MultiImage } from "./ui/MultiImage";
import { H2 } from "./core/typography/H2";

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
  service: ServicePublic;
};

/**
 * A component to render the name of the organization and of the related service
 * with the corresponding image
 */
const OrganizationHeader = (props: Props) => {
  const { service } = props;
  return (
    <Grid>
      <Col style={styles.leftColumnStyle}>
        <H2>{service.organization_name}</H2>
        <Text>{service.service_name}</Text>
      </Col>
      {service.service_id && (
        <Col style={styles.serviceCol}>
          <MultiImage
            style={styles.serviceMultiImage}
            source={logosForService(service)}
          />
        </Col>
      )}
    </Grid>
  );
};

export default OrganizationHeader;
