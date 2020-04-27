import * as pot from "italia-ts-commons/lib/pot";
import { H1, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";

import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { clipboardSetStringWithFeedback } from "../../utils/clipboard";
import { messageNeedsCTABar } from "../../utils/messages";
import { logosForService } from "../../utils/services";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import { MultiImage } from "../ui/MultiImage";
import MessageCTABar from "./MessageCTABar";
import MessageDetailRawInfoComponent from "./MessageDetailRawInfoComponent";
import MessageMarkdown from "./MessageMarkdown";

type OwnProps = {
  message: CreatedMessageWithContent;
  paymentsByRptId: PaymentByRptIdState;
  potService: pot.Pot<ServicePublic, Error>;
  onServiceLinkPress?: () => void;
  isDebugModeEnabled?: boolean;
};

type Props = OwnProps;

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
export default class MessageDetailComponent extends React.PureComponent<Props> {
  public render() {
    const {
      message,
      potService,
      paymentsByRptId,
      onServiceLinkPress,
      isDebugModeEnabled
    } = this.props;

    const service =
      potService !== undefined
        ? pot.isNone(potService)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderInfo"),
              department_name: I18n.t("messages.errorLoading.departmentInfo"),
              service_name: I18n.t("messages.errorLoading.serviceInfo")
            } as ServicePublic)
          : pot.toUndefined(potService)
        : undefined;

    const payment =
      message.content.payment_data !== undefined && service !== undefined
        ? paymentsByRptId[
            `${service.organization_fiscal_code}${
              message.content.payment_data.notice_number
            }`
          ]
        : undefined;

    return (
      <View style={styles.mainWrapper}>
        <View style={styles.headerContainer}>
          {/* Service */}
          {service && (
            <Grid style={styles.serviceContainer}>
              <Col>
                <H4>{service.organization_name}</H4>
                <TouchableDefaultOpacity onPress={onServiceLinkPress}>
                  <H6>{service.service_name}</H6>
                </TouchableDefaultOpacity>
              </Col>
              {service.service_id && (
                <Col style={styles.serviceCol}>
                  <TouchableDefaultOpacity onPress={onServiceLinkPress}>
                    <MultiImage
                      style={styles.serviceMultiImage}
                      source={logosForService(service)}
                    />
                  </TouchableDefaultOpacity>
                </Col>
              )}
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
                <ButtonDefaultOpacity
                  light={true}
                  bordered={true}
                  primary={true}
                  onPress={() => clipboardSetStringWithFeedback(message.id)}
                  style={{
                    height: variables.btnWidgetHeight,
                    paddingTop: 1,
                    paddingBottom: 2
                  }}
                >
                  <Text
                    style={{
                      fontSize: variables.fontSizeSmall,
                      lineHeight: variables.btnXSmallLineHeight,
                      paddingRight: 8,
                      paddingLeft: 8
                    }}
                  >
                    {I18n.t("clipboard.copyText")}
                  </Text>
                </ButtonDefaultOpacity>
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

        {messageNeedsCTABar(message) && (
          <MessageCTABar
            message={message}
            service={service}
            payment={payment}
          />
        )}

        <MessageMarkdown webViewStyle={styles.webview}>
          {message.content.markdown}
        </MessageMarkdown>
        <EdgeBorderComponent />
      </View>
    );
  }
}
