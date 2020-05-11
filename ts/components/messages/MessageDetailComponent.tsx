import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Content, H3, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { CreatedMessageWithContentAndAttachments } from "../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import { ServiceMetadataState } from "../../store/reducers/content";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import variables from "../../theme/variables";
import customVariables from "../../theme/variables";
import { messageNeedsCTABar } from "../../utils/messages";
import OrganizationHeader from "../OrganizationHeader";
import MedicalPrescriptionAttachments from "./MedicalPrescriptionAttachments";
import MedicalPrescriptionIdentifiersComponent from "./MedicalPrescriptionIdentifiersComponent";
import MessageCTABar from "./MessageCTABar";
import MessageDetailData from "./MessageDetailData";
import MessageMarkdown from "./MessageMarkdown";

type Props = Readonly<{
  message: CreatedMessageWithContentAndAttachments;
  paymentsByRptId: PaymentByRptIdState;
  potServiceDetail: pot.Pot<ServicePublic, Error>;
  potServiceMetadata: ServiceMetadataState;
  onServiceLinkPress?: () => void;
}>;

type State = Readonly<{
  isContentLoadCompleted: boolean;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: variables.contentPadding
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
  reducedText: {
    fontSize: customVariables.fontSizeSmall
  }
});

/**
 * A component to render the message detail. It has 2 main styles: traditional message and medical prescription
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

  private getTitle = () => {
    if (this.maybeMedicalData.isSome()) {
      return (
        <React.Fragment>
          <H3>{I18n.t("messages.medical.prescription")}</H3>
          <Text style={styles.reducedText}>
            {I18n.t("messages.medical.memo")}
          </Text>
        </React.Fragment>
      );
    }

    return <H3>{this.props.message.content.subject}</H3>;
  };

  get maybeMedicalData() {
    return fromNullable(this.props.message.content.prescription_data);
  }

  get attachments() {
    return fromNullable(this.props.message.content.attachments);
  }

  public render() {
    const {
      message,
      potServiceDetail,
      potServiceMetadata,
      paymentsByRptId,
      onServiceLinkPress
    } = this.props;
    const { maybeMedicalData } = this;

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
        <View style={styles.padded}>
          <View spacer={true} />
          {service !== undefined && (
            <React.Fragment>
              {service && <OrganizationHeader service={service} />}
              <View spacer={true} large={true} />
            </React.Fragment>
          )}
          {/* Subject */}
          {this.getTitle()}
          <View spacer={true} />
        </View>

        {maybeMedicalData.isSome() && (
          <MedicalPrescriptionIdentifiersComponent
            prescriptionData={maybeMedicalData.value}
          />
        )}

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

        {this.state.isContentLoadCompleted &&
          this.attachments.isSome() && (
            <MedicalPrescriptionAttachments
              attachments={this.attachments.value}
            />
          )}

        {this.state.isContentLoadCompleted && (
          <MessageDetailData
            message={message}
            serviceDetail={potServiceDetail}
            serviceMetadata={potServiceMetadata}
            goToServiceDetail={onServiceLinkPress}
          />
        )}
        <View spacer={true} extralarge={true} />
      </Content>
    );
  }
}
