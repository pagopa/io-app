import { H1, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid } from "react-native-easy-grid";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import * as pot from "../../types/pot";
import { logosForService } from "../../utils/services";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import Markdown from "../ui/Markdown";
import { MultiImage } from "../ui/MultiImage";
import MessageCTABar from "./MessageCTABar";
import MessageDetailRawInfoComponent from "./MessageDetailRawInfoComponent";

type OwnProps = {
  message: MessageWithContentPO;
  paymentByRptId: PaymentByRptIdState;
  service: pot.Pot<ServicePublic, Error>;
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

  subjectText: {
    lineHeight: 40
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
export default class MessageDetailComponent extends React.PureComponent<Props> {
  public render() {
    const { message, paymentByRptId, service, onServiceLinkPress } = this.props;
    return (
      <View>
        <View style={styles.headerContainer}>
          {/* Service */}
          {pot.isSome(service) && (
            <Grid style={styles.serviceContainer}>
              <Col>
                <H4>{service.value.organization_name}</H4>
                <H6 link={true} onPress={onServiceLinkPress}>
                  {service.value.service_name}
                </H6>
              </Col>
              <Col style={{ width: 60 }}>
                <TouchableOpacity onPress={onServiceLinkPress}>
                  <MultiImage
                    style={{ width: 60, height: 60 }}
                    source={logosForService(service.value)}
                  />
                </TouchableOpacity>
              </Col>
            </Grid>
          )}

          {/* Subject */}
          <View style={styles.subjectContainer}>
            <H1 style={styles.subjectText}>{message.content.subject}</H1>
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
          paymentByRptId={paymentByRptId}
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
