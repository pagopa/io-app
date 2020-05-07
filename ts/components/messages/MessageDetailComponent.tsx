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
import { logosForService } from "../../utils/services";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import { MultiImage } from "../ui/MultiImage";
import MessageDetailData from "./MessageDetailData";
import MessageMarkdown from "./MessageMarkdown";
import MessageDueDateBar from './MessageDueDateBar';
import PaymentButton from './PaymentButton';
import { fromNullable } from 'fp-ts/lib/Option';
import { getMessagePaymentExpirationInfo } from '../../utils/messages';
import CalendarEventButton from './CalendarEventButton';
import { isDatePassedAway } from '../../utils/dates';

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
  },
  row: {
    flexDirection: 'row'
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

  get paymentExpirationInfo() {
    const { message } = this.props;
    const { payment_data, due_date } = message.content;
    return fromNullable(payment_data).map(paymentData =>
      getMessagePaymentExpirationInfo(paymentData, due_date)
    );
  };

  // TODO: isolate as component
  private renderMessageCTAAsFooterButtons = () => {
    const { message } = this.props;
    const {payment, service} = this;

    /**
     * render the reminder button if:
     * - there is a due date
     * - if payment, the payment has not being completed yet
     * - if payment and if invalid_after_due_date is true, the due date is in the future
     */
    const checkReminderButtonVisibility = () => {
      const isDueDatePassed = message.content.due_date && isDatePassedAway(message.content.due_date) === 'EXPIRED';
      return message.content.due_date
          ? message.content.payment_data
            ? message.content.payment_data.invalid_after_due_date
              ? isDueDatePassed
              : true // TODO: check this condition - we add a reminder in the past!
            : isDueDatePassed
          : false
    };
    const showReminderButton = checkReminderButtonVisibility();

    /**
     * Render the payment button if:
     * - there is a payment for the message 
     * - the payment has not being completed yet
     */ 
    const showPaymentButton = this.paymentExpirationInfo.fold(false, _ =>  payment === undefined);

    if(!showReminderButton && !showPaymentButton){
      return null;
    }

    return (
      <View footer={true} style={styles.row}>
        {showReminderButton && (
          <CalendarEventButton message={message} />
        )}

        {(showReminderButton && showPaymentButton) && (<View hspacer={true}/>)}

        {payment === undefined && this.paymentExpirationInfo.isSome() && (
          <PaymentButton 
            message={message} 
            service={service} 
            paid={false} 
            messagePaymentExpirationInfo={this.paymentExpirationInfo.value}
          />
        )}
      </View>
    )
  }

  get service (){
    const {
      potServiceDetail,
    } = this.props;
    return  potServiceDetail !== undefined
        ? pot.isNone(potServiceDetail)
          ? ({
              organization_name: I18n.t("messages.errorLoading.senderInfo"),
              department_name: I18n.t("messages.errorLoading.departmentInfo"),
              service_name: I18n.t("messages.errorLoading.serviceInfo")
            } as ServicePublic)
          : pot.toUndefined(potServiceDetail)
        : undefined;
  }

  get payment() {
    const {message, paymentsByRptId} = this.props;
    return message.content.payment_data !== undefined && this.service !== undefined
      ? paymentsByRptId[
          `${this.service.organization_fiscal_code}${
            message.content.payment_data.notice_number
          }`
        ]
      : undefined;
  }

  public render() {
    const {
      message,
      potServiceDetail,
      potServiceMetadata,
      onServiceLinkPress
    } = this.props;
    const {service, payment} = this;
    
    return (
      <React.Fragment>
      <Content noPadded={true}>
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
        </View>

       
        <MessageDueDateBar
          message={message}
          service={service}
          payment={payment}
        />

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
      </Content>
      {this.renderMessageCTAAsFooterButtons()}
      </React.Fragment>
    );
  }
}
