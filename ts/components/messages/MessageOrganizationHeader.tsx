import { Col, Grid, Text } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import customVariables from "../../theme/variables";
import { logosForService } from "../../utils/services";
import H5 from "../ui/H5";
import { MultiImage } from "../ui/MultiImage";

const styles = StyleSheet.create({
  serviceCol: {
    width: 60
  },
  serviceMultiImage: {
    width: 60,
    height: 60
  },
  reducedText: {
    fontSize: customVariables.fontSizeSmall
  }
});

type Props = {
  service: ServicePublic;
};

/**
 * A component to render the name of the organization and of the related service
 * with the corresponding image
 */
class MessageOrganizationHeader extends React.PureComponent<Props> {
  public render() {
    const { service } = this.props;
    return (
      <Grid>
        <Col>
          <H5>{service.organization_name}</H5>
          <Text style={styles.reducedText}>{service.service_name}</Text>
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
  }
}

export default MessageOrganizationHeader;
