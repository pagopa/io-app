import { H1, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid } from "react-native-easy-grid";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { logosForService } from "../../utils/services";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import Markdown from "../ui/Markdown";
import { MultiImage } from "../ui/MultiImage";
import MessageCTABar from "./MessageCTABar";
import MessageDetailRawInfoComponent from "./MessageDetailRawInfoComponent";

type OwnProps = {
  message: MessageWithContentPO;
  service?: ServicePublic;
  onServiceLinkPress?: () => void;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  headerContainer: {
    padding: variables.contentPadding
  },

  serviceContainer: {
    marginBottom: variables.contentPadding
  },

  subjectContainer: {
    marginBottom: variables.contentPadding
  },

  ctaBarContainer: {
    backgroundColor: variables.contentAlternativeBackground,
    padding: variables.contentPadding,
    marginBottom: variables.contentPadding
  },

  markdownContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

/**
 * A component to render the message detail.
 */
class MessageDetailComponent extends React.PureComponent<Props, never> {
  public render() {
    const { message, service, onServiceLinkPress } = this.props;

    return (
      <View>
        <View style={styles.headerContainer}>
          {/* Service */}
          {service && (
            <Grid style={styles.serviceContainer}>
              <Col>
                <H4>{service.organization_name}</H4>
                <H6 link={true} onPress={onServiceLinkPress}>
                  {service.service_name}
                </H6>
              </Col>
              <Col style={{ width: 60 }}>
                <TouchableOpacity onPress={onServiceLinkPress}>
                  <MultiImage
                    style={{ width: 60, height: 60 }}
                    source={logosForService(service)}
                  />
                </TouchableOpacity>
              </Col>
            </Grid>
          )}

          {/* Subject */}
          <View style={styles.subjectContainer}>
            <H1>{message.content.subject}</H1>
          </View>

          {/* RawInfo */}
          <MessageDetailRawInfoComponent
            message={message}
            service={service}
            onServiceLinkPress={onServiceLinkPress}
          />
        </View>

        <MessageCTABar
          message={message}
          service={service}
          containerStyle={styles.ctaBarContainer}
        />

        <View style={styles.markdownContainer}>
          <Markdown
            lazyOptions={{ lazy: true }}
            initialState={{ screen: "MESSAGE_DETAIL" }}
          >
            {message.content.markdown}
          </Markdown>
        </View>
      </View>
    );
  }
}

export default MessageDetailComponent;
