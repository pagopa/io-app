import * as pot from "italia-ts-commons/lib/pot";
import { H1, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { logosForService } from "../../utils/services";
import MarkdownViewer from "../MarkdownViewer";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
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
    flexDirection: "column",
    padding: variables.contentPadding
  },

  serviceContainer: {
    flexDirection: "row",
    marginBottom: variables.contentPadding
  },

  serviceName: {
    flex: 1
  },

  serviceLogo: {
    width: 60
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

  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
  }
});

/**
 * A component to render the message detail.
 */
export default class MessageDetailComponent extends React.PureComponent<Props> {
  public render() {
    const { message, paymentByRptId, service, onServiceLinkPress } = this.props;
    return (
      <React.Fragment>
        <View style={styles.headerContainer}>
          {/* Service */}
          {pot.isSome(service) && (
            <View style={styles.serviceContainer}>
              <View style={styles.serviceName}>
                <H4>{service.value.organization_name}</H4>
                <H6 link={true} onPress={onServiceLinkPress}>
                  {service.value.service_name}
                </H6>
              </View>
              <View style={styles.serviceLogo}>
                <TouchableOpacity onPress={onServiceLinkPress}>
                  <MultiImage
                    style={{ width: 60, height: 60 }}
                    source={logosForService(service.value)}
                  />
                </TouchableOpacity>
              </View>
            </View>
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

        <MarkdownViewer
          markdown={message.content.markdown}
          htmlBodyClasses={"message--detail"}
          webViewStyle={styles.webview}
        />
      </React.Fragment>
    );
  }
}
