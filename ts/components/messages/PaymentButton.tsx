import { Text } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { MessagePaymentExpirationInfo, isExpired, isUnexpirable } from "../../utils/messages";
import { formatPaymentAmount, getAmountFromPaymentAmount, getRptIdFromNoticeNumber } from "../../utils/payment";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import IconFont from "../ui/IconFont";
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { navigateToMessageDetailScreenAction, navigateToPaymentTransactionSummaryScreen, navigateToWalletHome } from '../../store/actions/navigation';
import { fromNullable } from 'fp-ts/lib/Option';
import { ServicePublic } from '../../../definitions/backend/ServicePublic';
import { CreatedMessageWithContent } from '../../../definitions/backend/CreatedMessageWithContent';
import { loadServiceDetail } from '../../store/actions/services';
import { GlobalState } from '../../store/reducers/types';
import { isProfileEmailValidatedSelector } from '../../store/reducers/profile';
import { isUpdateNeeded } from '../../utils/appVersion';
import { serverInfoDataSelector } from '../../store/reducers/backendInfo';
import { paymentInitializeState } from '../../store/actions/wallet/payment';
import { InferNavigationParams } from '../../types/react';
import TransactionSummaryScreen from '../../screens/wallet/payment/TransactionSummaryScreen';

type OwnProps = {
  paid: boolean;
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo;
  small?: boolean;
  disabled?: boolean;
  message: CreatedMessageWithContent;
  service?: ServicePublic
};

type Props = OwnProps & ReturnType<typeof mapDispatchToProps> & ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  button: {
    flex: 1
  }
});

const getButtonText = (
  messagePaymentExpirationInfo: MessagePaymentExpirationInfo,
  paid: boolean
): string => {
  const { amount } = messagePaymentExpirationInfo;

  if (paid) {
    return I18n.t("messages.cta.paid", {
      amount: formatPaymentAmount(amount)
    });
  }

  if (isExpired(messagePaymentExpirationInfo)) {
    return I18n.t("messages.cta.payment.expired");
  }

  return I18n.t("messages.cta.pay", {
    amount: formatPaymentAmount(amount)
  });
};

/**
 * A component to render the button related to the payment
 * paired with a message.
 */
class PaymentButton extends React.PureComponent<Props> {

  private hideIcon = isUnexpirable(this.props.messagePaymentExpirationInfo) || isExpired(this.props.messagePaymentExpirationInfo) || !this.props.small;


  private navigateToMessageDetail = () => {
    this.props.navigateToMessageDetail(this.props.message.id);
  };

  private handleOnPress = () => {
    const {messagePaymentExpirationInfo, service, paid, disabled, message } = this.props;
    const expired = isExpired(this.props.messagePaymentExpirationInfo);
    const amount = getAmountFromPaymentAmount(
      messagePaymentExpirationInfo.amount
    );

    const rptId = fromNullable(service).chain(_ =>
      getRptIdFromNoticeNumber(
        _.organization_fiscal_code,
        messagePaymentExpirationInfo.noticeNumber
      )
    );
    
    if(expired){
      this.navigateToMessageDetail()
    }

    if(!disabled && !paid && amount.isSome() && rptId.isSome()){
        this.props.refreshService(message.sender_service_id);
        // TODO: optimize the managment of the payment initialization https://www.pivotaltracker.com/story/show/169702534
        if (
          this.props.isEmailValidated &&
          !this.props.isUpdatedNeededPagoPa
        ) {
          this.props.paymentInitializeState();
          this.props.navigateToPaymentTransactionSummaryScreen({
            rptId: rptId.value,
            initialAmount: amount.value
          });
        } else {
          // Navigating to Wallet home, having the email address is not validated,
          // it will be displayed RemindEmailValidationOverlay
          this.props.navigateToWalletHomeScreen();
      }
    }
  }


  private paidButton = (
    <ButtonDefaultOpacity
          xsmall={this.props.small}
          gray={true}
          style={styles.button}
        >
          <IconFont
            name={"io-tick-big"}
          />
          <Text>
            {getButtonText(this.props.messagePaymentExpirationInfo, true)}
          </Text>
        </ButtonDefaultOpacity>
  );

  public render() {
    const {
      paid,
      messagePaymentExpirationInfo,
      small,
      disabled
    } = this.props; 

    if (paid) {
      return this.paidButton;
    }

    return (
      <ButtonDefaultOpacity
        primary={!isExpired(messagePaymentExpirationInfo) && !disabled}
        disabled={disabled}
        onPress={this.handleOnPress}
        darkGray={isExpired(messagePaymentExpirationInfo)}
        xsmall={small}
        small={!small}
        style={
          styles.button
        }
      >
        {!this.hideIcon ||
          (paid && (
            <IconFont
              name={"io-timer"}
              color={!disabled ? customVariables.brandHighlight : undefined}
            />
          ))}
        <Text
        >
          {getButtonText(messagePaymentExpirationInfo, false)}
        </Text>
      </ButtonDefaultOpacity>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isEmailValidated: isProfileEmailValidatedSelector(state),
  isUpdatedNeededPagoPa: isUpdateNeeded(
    serverInfoDataSelector(state),
    "min_app_version_pagopa"
  )
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToMessageDetail: (messageId: string) =>
    dispatch(navigateToMessageDetailScreenAction({ messageId })),
  refreshService: (serviceId: string) =>
    dispatch(loadServiceDetail.request(serviceId)),
  paymentInitializeState: () => dispatch(paymentInitializeState()),
  navigateToPaymentTransactionSummaryScreen: (params: InferNavigationParams<typeof TransactionSummaryScreen>) =>
    dispatch(navigateToPaymentTransactionSummaryScreen(params)),
  navigateToWalletHomeScreen: () => dispatch(navigateToWalletHome()),


})

export default connect(mapStateToProps, mapDispatchToProps)(PaymentButton);
