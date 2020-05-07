import * as pot from "italia-ts-commons/lib/pot";
import { Content, H1, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { ServiceMetadataState } from "../../store/reducers/content";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import { messageNeedsCTABar } from "../../utils/messages";
import { logosForService } from "../../utils/services";
import { EdgeBorderComponent } from "../screens/EdgeBorderComponent";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import { MultiImage } from "../ui/MultiImage";
import MessageCTABar from "./MessageCTABar";
import MessageDetailData from "./MessageDetailData";
import MessageMarkdown from "./MessageMarkdown";

type Props = Readonly<{
  message: CreatedMessageWithContent;
  paymentsByRptId: PaymentByRptIdState;
  potServiceDetail: pot.Pot<ServicePublic, Error>;
  potServiceMetadata: ServiceMetadataState;
  onServiceLinkPress?: () => void;
}>;

type State = Readonly<{
  isContentLoadCompleted: boolean;
}>;

const styles = StyleSheet.create({
  headerContainer: {
    padding: variables.contentPadding
  },
  serviceContainer: {
    marginBottom: variables.contentPadding
  },
  subjectContainer: {
    marginBottom: variables.spacerSmallHeight
  },
  ctaBarContainer: {
    backgroundColor: variables.brandGray,
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
export default class MessageDetailComponent extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { isContentLoadCompleted: false };
  }

  private onMarkdownLoadEnd = () => {
    this.setState({ isContentLoadCompleted: true });
  };

  public render() {
    const {
      message,
      potServiceDetail,
      potServiceMetadata,
      paymentsByRptId,
      onServiceLinkPress
    } = this.props;

    const service =
      potServiceDetail !== undefined
        ? pot.isNone(potServiceDetail)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderInfo"),
              department_name: I18n.t("messages.errorLoading.departmentInfo"),
              service_name: I18n.t("messages.errorLoading.serviceInfo")
            } as ServicePublic)
          : pot.toUndefined(potServiceDetail)
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
      <Content noPadded={true}>
        <View style={styles.headerContainer}>
          {/** TODO: update header */}
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
        </View>

        {this.state.isContentLoadCompleted &&
          messageNeedsCTABar(message) && (
            <MessageCTABar
              message={message}
              service={service}
              payment={payment}
            />
          )}

        <MessageMarkdown
          webViewStyle={styles.webview}
          onLoadEnd={this.onMarkdownLoadEnd}
        >
          {message.content.markdown}
        </MessageMarkdown>

        {this.state.isContentLoadCompleted && (
          <MessageDetailData
            message={message}
            serviceDetail={potServiceDetail}
            serviceMetadata={potServiceMetadata}
            goToServiceDetail={onServiceLinkPress}
          />
        )}
        <View spacer={true} large={true} />
      </Content>
    );
  }
}
