import * as pot from "italia-ts-commons/lib/pot";
import { Button, H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { logosForService } from "../../utils/services";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import { MultiImage } from "../ui/MultiImage";
import MessageCTABar from "./MessageCTABar";
import MessageDetailRawInfoComponent from "./MessageDetailRawInfoComponent";
import MessageMarkdown from "./MessageMarkdown";

type OwnProps = {
  message: MessageWithContentPO;
  paymentByRptId: PaymentByRptIdState;
  service: pot.Pot<ServicePublic, Error>;
  onServiceLinkPress?: () => void;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  mainWrapper: {
    paddingBottom: 100
  },

  headerContainer: {
    padding: variables.contentPadding
  },

  serviceContainer: {
    marginBottom: variables.contentPadding
  },

  subjectContainer: {
    marginBottom: variables.spacerHeight
  },

  ctaBarContainer: {
    backgroundColor: variables.contentAlternativeBackground,
    padding: variables.contentPadding,
    marginBottom: variables.contentPadding
  },

  webview: {
    marginLeft: variables.contentPadding,
    marginRight: variables.contentPadding
  },
  messageIDContainer: {
    width: "100%",
    alignContent: "space-between",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap"
  },
  messageIDLabelContainer: {
    flex: 1,
    height: variables.lineHeightBase,
    marginBottom: 5
  },
  messageIDLabelText: {
    fontSize: variables.fontSizeSmaller
  },
  messageIDBtnContainer: {
    width: 48,
    flex: 0,
    marginBottom: 5,
    height: variables.lineHeightBase
  },
  serviceCol: {
    width: 60
  },
  serviceMultiImage: {
    width: 60,
    height: 60
  }
});

/**
 * A component to render the message detail.
 */
class MessageDetailComponent extends React.PureComponent<Props> {
  public render() {
    const {
      message,
      paymentByRptId,
      service,
      onServiceLinkPress,
      isDebugModeEnabled
    } = this.props;
    return (
      <View style={styles.mainWrapper}>
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
              <Col style={styles.serviceCol}>
                <TouchableOpacity onPress={onServiceLinkPress}>
                  <MultiImage
                    style={styles.serviceMultiImage}
                    source={logosForService(service.value)}
                  />
                </TouchableOpacity>
              </Col>
            </Grid>
          )}

          {/* Subject */}
          <View style={styles.subjectContainer}>
            <H1>{message.content.subject}</H1>
          </View>

          {isDebugModeEnabled && (
            <View style={styles.messageIDContainer}>
              <View style={styles.messageIDLabelContainer}>
                <Text style={styles.messageIDLabelText}>ID: {message.id}</Text>
              </View>
              <View style={styles.messageIDBtnContainer}>
                <Button
                  widget={true}
                  light={true}
                  bordered={true}
                  primary={true}
                  onPress={() => clipboardSetStringWithFeedback(message.id)}
                >
                  <Text>{I18n.t("clipboard.copyText")}</Text>
                </Button>
              </View>
            </View>
          )}

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

        <MessageMarkdown webViewStyle={styles.webview}>
          {message.content.markdown}
        </MessageMarkdown>
      </View>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isDebugModeEnabled: state.debug.isDebugModeEnabled
});

export const MessageDetail = connect(mapStateToProps)(MessageDetailComponent);
