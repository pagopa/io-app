import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { CompatNavigationProp } from "@react-navigation/compat";
import { useNavigation } from "@react-navigation/native";
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { ActionSheet, Content, View } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, StyleSheet, Text } from "react-native";
import { connect } from "react-redux";
import { ImportoEuroCents } from "../../../../definitions/backend/ImportoEuroCents";
import { PaymentRequestsGetResponse } from "../../../../definitions/backend/PaymentRequestsGetResponse";
import { PspData } from "../../../../definitions/pagopa/PspData";
import CardIcon from "../../../../img/wallet/card.svg";
import BancomatPayLogo from "../../../../img/wallet/payment-methods/bancomat_pay.svg";
import PaypalLogo from "../../../../img/wallet/payment-methods/paypal/paypal_logo.svg";
import TagIcon from "../../../../img/wallet/tag.svg";
import { H1 } from "../../../components/core/typography/H1";
import { H3 } from "../../../components/core/typography/H3";
import { H4 } from "../../../components/core/typography/H4";
import { LabelSmall } from "../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../components/core/variables/IOColors";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../../components/helpers/withLoadingSpinner";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import IconFont from "../../../components/ui/IconFont";
import { LightModalContextInterface } from "../../../components/ui/LightModal";
import { getCardIconFromBrandLogo } from "../../../components/wallet/card/Logo";
import { PayWebViewModal } from "../../../components/wallet/PayWebViewModal";
import { SelectionBox } from "../../../components/wallet/SelectionBox";
import { pagoPaApiUrlPrefix, pagoPaApiUrlPrefixTest } from "../../../config";
import { confirmButtonProps } from "../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import {
  getValueOrElse,
  isError,
  isLoading,
  isReady
} from "../../../features/bonus/bpd/model/RemoteValue";
import { BrandImage } from "../../../features/wallet/component/card/BrandImage";
import I18n from "../../../i18n";
import { IOStackNavigationProp } from "../../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../../navigation/params/WalletParamsList";
import ROUTES from "../../../navigation/routes";
import {
  navigateToPaymentOutcomeCode,
  navigateToPaymentPickPaymentMethodScreen,
  navigateToPaymentPickPspScreen
} from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import { paymentOutcomeCode } from "../../../store/actions/wallet/outcomeCode";
import {
  abortRunningPayment,
  paymentCompletedFailure,
  paymentCompletedSuccess,
  paymentExecuteStart,
  PaymentMethodType,
  paymentWebViewEnd,
  PaymentWebViewEndReason
} from "../../../store/actions/wallet/payment";
import { fetchTransactionsRequestWithExpBackoff } from "../../../store/actions/wallet/transactions";
import {
  bancomatPayConfigSelector,
  isPaypalEnabledSelector
} from "../../../store/reducers/backendStatus";
import { isPagoPATestEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../store/reducers/types";
import { outcomeCodesSelector } from "../../../store/reducers/wallet/outcomeCode";
import {
  paymentStartPayloadSelector,
  PaymentStartWebViewPayload,
  pmSessionTokenSelector,
  pspSelectedV2ListSelector,
  pspV2ListSelector
} from "../../../store/reducers/wallet/payment";
import { paymentMethodByIdSelector } from "../../../store/reducers/wallet/wallets";
import { OutcomeCodesKey } from "../../../types/outcomeCode";
import {
  isCreditCard,
  isRawPayPal,
  PaymentMethod,
  Wallet
} from "../../../types/pagopa";
import { PayloadForAction } from "../../../types/utils";
import { getTranslatedShortNumericMonthYear } from "../../../utils/dates";
import { getLocalePrimaryWithFallback } from "../../../utils/locale";
import { isPaymentOutcomeCodeSuccessfully } from "../../../utils/payment";
import { getPaypalAccountEmail } from "../../../utils/paypal";
import { getLookUpIdPO } from "../../../utils/pmLookUpId";
import { showToast } from "../../../utils/showToast";
import { formatNumberCentsToAmount } from "../../../utils/stringBuilder";
import { openWebUrl } from "../../../utils/url";

// temporary feature flag since this feature is still WIP
// (missing task to complete https://pagopa.atlassian.net/browse/IA-684?filter=10121)
export const editPaypalPspEnabled = false;

export type ConfirmPaymentMethodScreenNavigationParams = Readonly<{
  rptId: RptId;
  initialAmount: AmountInEuroCents;
  verifica: PaymentRequestsGetResponse;
  idPayment: string;
  wallet: Wallet;
  psps: ReadonlyArray<PspData>;
}>;

type ConfirmPaymentNavigationProps = IOStackNavigationProp<
  WalletParamsList,
  "PAYMENT_CONFIRM_PAYMENT_METHOD"
>;

type OwnProps = {
  navigation: CompatNavigationProp<ConfirmPaymentNavigationProps>;
};

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface &
  OwnProps;

const styles = StyleSheet.create({
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: IOColors.greyLight
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center"
  },

  iconRowText: { marginLeft: 8 },

  flex: { flex: 1 }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.whyAFee.title",
  body: "wallet.whyAFee.text"
};

const payUrlSuffix = "/v3/webview/transactions/pay";
const webViewExitPathName = "/v3/webview/logout/bye";
const webViewOutcomeParamName = "outcome";

type ComputedPaymentMethodInfo = {
  logo: JSX.Element;
  subject: string;
  caption: string;
  accessibilityLabel: string;
};

const getPaymentMethodInfo = (
  paymentMethod: PaymentMethod | undefined,
  options: { isPaypalEnabled: boolean; isBPayPaymentEnabled: boolean }
): Option<ComputedPaymentMethodInfo> => {
  switch (paymentMethod?.kind) {
    case "CreditCard":
      const holder = paymentMethod.info.holder ?? "";
      const expiration =
        getTranslatedShortNumericMonthYear(
          paymentMethod.info.expireYear,
          paymentMethod.info.expireMonth
        ) ?? "";

      return some({
        logo: (
          <BrandImage
            image={getCardIconFromBrandLogo(paymentMethod.info)}
            scale={0.7}
          />
        ),
        subject: `${holder}${expiration ? " · " + expiration : ""}`,
        expiration,
        caption: paymentMethod.caption ?? "",
        accessibilityLabel: `${I18n.t(
          "wallet.accessibility.folded.creditCard",
          {
            brand: paymentMethod.info.brand,
            blurredNumber: paymentMethod.info.blurredNumber
          }
        )}, ${holder}, ${expiration}`
      });

    case "PayPal":
      const paypalEmail = getPaypalAccountEmail(paymentMethod.info);
      return some({
        logo: <PaypalLogo width={24} height={24} />,
        subject: paypalEmail,
        caption: I18n.t("wallet.onboarding.paypal.name"),
        accessibilityLabel: `${I18n.t(
          "wallet.onboarding.paypal.name"
        )}, ${paypalEmail}`
      }).filter(() => options.isPaypalEnabled);
    case "BPay":
      return some({
        logo: <BancomatPayLogo width={24} height={24} />,
        subject: paymentMethod?.caption,
        caption: paymentMethod.info.numberObfuscated ?? "",
        accessibilityLabel: `${I18n.t("wallet.methods.bancomatPay.name")}`
      }).filter(() => options.isBPayPaymentEnabled);

    default:
      return none;
  }
};

const ConfirmPaymentMethodScreen: React.FC<Props> = (props: Props) => {
  React.useEffect(() => {
    // show a toast if we got an error while retrieving pm session token
    if (props.retrievingSessionTokenError.isSome()) {
      showToast(I18n.t("global.actions.retry"));
    }
  }, [props.retrievingSessionTokenError]);

  const urlPrefix = props.isPagoPATestEnabled
    ? pagoPaApiUrlPrefixTest
    : pagoPaApiUrlPrefix;

  const verifica: PaymentRequestsGetResponse =
    props.navigation.getParam("verifica");
  const wallet: Wallet = props.navigation.getParam("wallet");
  const idPayment: string = props.navigation.getParam("idPayment");
  const paymentReason = verifica.causaleVersamento;
  const maybePsp = fromNullable(wallet.psp);
  const isPayingWithPaypal = isRawPayPal(wallet.paymentMethod);
  const navigation = useNavigation<ConfirmPaymentNavigationProps>();
  // each payment method has its own psp fee
  const paymentMethodType = isPayingWithPaypal ? "PayPal" : "CreditCard";
  const fee: number | undefined = isPayingWithPaypal
    ? props.paypalSelectedPsp?.fee
    : maybePsp.fold(undefined, psp => psp.fixedCost.amount);

  const totalAmount =
    (verifica.importoSingoloVersamento as number) + (fee ?? 0);

  // emit an event to inform the pay web view finished
  // dispatch the outcome code and navigate to payment outcome code screen
  const handlePaymentOutcome = (maybeOutcomeCode: Option<string>) => {
    // the outcome is a payment done successfully
    if (
      maybeOutcomeCode.isSome() &&
      isPaymentOutcomeCodeSuccessfully(
        maybeOutcomeCode.value,
        props.outcomeCodes
      )
    ) {
      // store the rptid of a payment done
      props.dispatchPaymentCompleteSuccessfully(
        props.navigation.getParam("rptId")
      );
      // refresh transactions list
      props.loadTransactions();
    } else {
      props.dispatchPaymentFailure(
        maybeOutcomeCode.filter(OutcomeCodesKey.is).toUndefined(),
        idPayment
      );
    }
    props.dispatchEndPaymentWebview("EXIT_PATH", paymentMethodType);
    props.dispatchPaymentOutCome(maybeOutcomeCode, paymentMethodType);
    props.navigateToOutComePaymentScreen((fee ?? 0) as ImportoEuroCents);
  };

  // the user press back during the pay web view challenge
  const handlePayWebviewGoBack = () => {
    Alert.alert(I18n.t("payment.abortWebView.title"), "", [
      {
        text: I18n.t("payment.abortWebView.confirm"),
        onPress: () => {
          props.dispatchCancelPayment();
          props.dispatchEndPaymentWebview("USER_ABORT", paymentMethodType);
        },
        style: "cancel"
      },
      {
        text: I18n.t("payment.abortWebView.cancel")
      }
    ]);
  };

  // navigate to the screen where the user can pick the desired psp
  const handleOnEditPaypalPsp = () => {
    navigation.navigate(ROUTES.WALLET_PAYPAL_UPDATE_PAYMENT_PSP, {
      idWallet: wallet.idWallet,
      idPayment
    });
  };

  // Handle the PSP change, this will trigger
  // a different callback for a payment with PayPal.
  const handleChangePsp = isPayingWithPaypal
    ? handleOnEditPaypalPsp
    : props.pickPsp;

  const formData = props.payStartWebviewPayload
    .map<Record<string, string | number>>(payload => ({
      ...payload,
      ...getLookUpIdPO()
    }))
    .getOrElse({});

  const paymentMethod = props.getPaymentMethodById(wallet.idWallet);
  const isPaymentMethodCreditCard =
    paymentMethod !== undefined && isCreditCard(paymentMethod);

  const formattedSingleAmount = formatNumberCentsToAmount(
    verifica.importoSingoloVersamento,
    true
  );
  const formattedTotal = formatNumberCentsToAmount(totalAmount, true);
  const formattedFees = formatNumberCentsToAmount(fee ?? 0, true);

  // Retrieve all the informations needed by the
  // user interface based on the payment method
  // selected by the user.
  const paymentMethodInfo = getPaymentMethodInfo(paymentMethod, {
    isPaypalEnabled: props.isPaypalEnabled,
    isBPayPaymentEnabled: props.isBPayPaymentEnabled
  }).getOrElse({
    subject: "",
    caption: "",
    logo: <View />,
    accessibilityLabel: ""
  });

  // It should be possible to change PSP only when the user
  // is not paying using PayPal or the relative flag is
  // enabled.
  const canChangePsp = !isPayingWithPaypal || editPaypalPspEnabled;

  // The privacy url needed when paying
  // using PayPal.
  const privacyUrl = props.paypalSelectedPsp?.privacyUrl;

  // Retrieve the PSP name checking if the user is
  // paying using PayPal or another method. The PSP
  // could always be `undefined`.
  const pspName = fromNullable(
    isPayingWithPaypal
      ? props.paypalSelectedPsp?.ragioneSociale
      : wallet.psp?.businessName
  )
    .map(name => `${I18n.t("wallet.ConfirmPayment.providedBy")} ${name}`)
    .getOrElse(I18n.t("payment.noPsp"));

  return (
    <BaseScreenComponent
      goBack={props.onCancel}
      headerTitle={I18n.t("wallet.ConfirmPayment.header")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["payment"]}
      backButtonTestID="cancelPaymentButton"
    >
      <SafeAreaView style={styles.flex}>
        <Content noPadded={true}>
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer />

            <View
              style={styles.totalContainer}
              accessibilityRole="header"
              accessibilityLabel={`${I18n.t(
                "wallet.ConfirmPayment.total"
              )} ${formattedTotal}`}
              accessible
            >
              <H1>{I18n.t("wallet.ConfirmPayment.total")}</H1>
              <H1>{formattedTotal}</H1>
            </View>

            <View spacer large />

            <View style={styles.iconRow}>
              <IconFont
                name="io-info"
                size={20}
                style={{
                  color: IOColors.bluegrey
                }}
              />

              <H3
                color="bluegrey"
                style={styles.iconRowText}
                accessibilityRole="header"
              >
                {I18n.t("wallet.ConfirmPayment.paymentInformations")}
              </H3>
            </View>

            <View spacer />

            <View
              accessibilityLabel={`${paymentReason}, ${formattedSingleAmount}`}
              accessible
            >
              <H4 weight="SemiBold" color="bluegreyDark" numberOfLines={1}>
                {paymentReason}
              </H4>

              <LabelSmall color="bluegrey" weight="Regular">
                {formattedSingleAmount}
              </LabelSmall>
            </View>

            <View spacer large />

            <View style={styles.iconRow}>
              <CardIcon width={20} height={20} />

              <H3
                color="bluegrey"
                style={styles.iconRowText}
                accessibilityRole="header"
              >
                {I18n.t("wallet.ConfirmPayment.payWith")}
              </H3>
            </View>

            <View spacer />

            <SelectionBox
              logo={paymentMethodInfo.logo}
              mainText={paymentMethodInfo.caption}
              subText={paymentMethodInfo.subject}
              ctaText={I18n.t("wallet.ConfirmPayment.edit")}
              onPress={props.pickPaymentMethod}
              accessibilityLabel={`${
                paymentMethodInfo.accessibilityLabel
              }, ${I18n.t("wallet.ConfirmPayment.accessibility.edit")}`}
            />

            <View spacer large />

            <View style={styles.iconRow}>
              <TagIcon width={20} height={20} />

              <H3
                color="bluegrey"
                style={styles.iconRowText}
                accessibilityRole="header"
              >
                {I18n.t("wallet.ConfirmPayment.transactionCosts")}
              </H3>
            </View>

            <View spacer />

            <SelectionBox
              mainText={formattedFees}
              subText={pspName}
              ctaText={
                canChangePsp ? I18n.t("wallet.ConfirmPayment.edit") : undefined
              }
              onPress={canChangePsp ? handleChangePsp : undefined}
              accessibilityLabel={`${I18n.t(
                "wallet.ConfirmPayment.accessibility.transactionCosts",
                {
                  cost: formattedFees,
                  psp: pspName
                }
              )}${
                canChangePsp
                  ? ", " + I18n.t("wallet.ConfirmPayment.accessibility.edit")
                  : ""
              }`}
            />

            {isPayingWithPaypal && privacyUrl && (
              <>
                <View spacer={true} />

                <Text
                  onPress={() => openWebUrl(privacyUrl)}
                  accessibilityRole="link"
                >
                  <LabelSmall color="bluegrey" weight="Regular">
                    {`${I18n.t(
                      "wallet.onboarding.paypal.paymentCheckout.privacyDisclaimer"
                    )} `}
                  </LabelSmall>

                  <LabelSmall weight="SemiBold">
                    {I18n.t(
                      "wallet.onboarding.paypal.paymentCheckout.privacyTerms"
                    )}
                  </LabelSmall>
                </Text>
              </>
            )}

            <View spacer extralarge />
          </View>
        </Content>

        {props.payStartWebviewPayload.isSome() && (
          <PayWebViewModal
            postUri={urlPrefix + payUrlSuffix}
            formData={formData}
            showInfoHeader={isPaymentMethodCreditCard}
            finishPathName={webViewExitPathName}
            onFinish={handlePaymentOutcome}
            outcomeQueryparamName={webViewOutcomeParamName}
            onGoBack={handlePayWebviewGoBack}
            modalHeaderTitle={I18n.t("wallet.challenge3ds.header")}
          />
        )}

        <FooterWithButtons
          type="SingleButton"
          leftButton={confirmButtonProps(
            () =>
              props.dispatchPaymentStart({
                idWallet: wallet.idWallet,
                idPayment,
                language: getLocalePrimaryWithFallback()
              }),
            `${I18n.t("wallet.ConfirmPayment.pay")} ${formattedTotal}`,
            undefined,
            undefined,
            props.payStartWebviewPayload.isSome()
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapStateToProps = (state: GlobalState) => {
  const pmSessionToken = pmSessionTokenSelector(state);
  const paymentStartPayload = paymentStartPayloadSelector(state);
  // if there is no psp selected pick the default one from the list (if any)
  const paypalSelectedPsp: PspData | undefined =
    pspSelectedV2ListSelector(state) ||
    getValueOrElse(pspV2ListSelector(state), []).find(psp => psp.defaultPsp);
  const payStartWebviewPayload: Option<PaymentStartWebViewPayload> =
    isReady(pmSessionToken) && paymentStartPayload
      ? some({ ...paymentStartPayload, sessionToken: pmSessionToken.value })
      : none;
  return {
    paypalSelectedPsp,
    getPaymentMethodById: (idWallet: number) =>
      paymentMethodByIdSelector(state, idWallet),
    isPagoPATestEnabled: isPagoPATestEnabledSelector(state),
    outcomeCodes: outcomeCodesSelector(state),
    isPaypalEnabled: isPaypalEnabledSelector(state),
    isBPayPaymentEnabled: bancomatPayConfigSelector(state).payment,
    payStartWebviewPayload,
    isLoading: isLoading(pmSessionToken),
    retrievingSessionTokenError: isError(pmSessionToken)
      ? some(pmSessionToken.error.message)
      : none
  };
};

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => {
  const dispatchCancelPayment = () => {
    dispatch(abortRunningPayment());
    showToast(I18n.t("wallet.ConfirmPayment.cancelPaymentSuccess"), "success");
  };
  return {
    pickPaymentMethod: () =>
      navigateToPaymentPickPaymentMethodScreen({
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica"),
        idPayment: props.navigation.getParam("idPayment")
      }),
    pickPsp: () =>
      navigateToPaymentPickPspScreen({
        rptId: props.navigation.getParam("rptId"),
        initialAmount: props.navigation.getParam("initialAmount"),
        verifica: props.navigation.getParam("verifica"),
        idPayment: props.navigation.getParam("idPayment"),
        psps: props.navigation.getParam("psps"),
        wallet: props.navigation.getParam("wallet"),
        chooseToChange: true
      }),
    onCancel: () => {
      ActionSheet.show(
        {
          options: [
            I18n.t("wallet.ConfirmPayment.confirmCancelPayment"),
            I18n.t("wallet.ConfirmPayment.confirmContinuePayment")
          ],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
          title: I18n.t("wallet.ConfirmPayment.confirmCancelTitle")
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            dispatchCancelPayment();
          }
        }
      );
    },
    dispatchPaymentStart: (
      payload: PayloadForAction<typeof paymentExecuteStart["request"]>
    ) => dispatch(paymentExecuteStart.request(payload)),
    dispatchEndPaymentWebview: (
      reason: PaymentWebViewEndReason,
      paymentMethodType: PaymentMethodType
    ) => {
      dispatch(paymentWebViewEnd({ reason, paymentMethodType }));
    },
    dispatchCancelPayment,
    dispatchPaymentOutCome: (
      outComeCode: Option<string>,
      paymentMethodType: PaymentMethodType
    ) =>
      dispatch(paymentOutcomeCode({ outcome: outComeCode, paymentMethodType })),
    navigateToOutComePaymentScreen: (fee: ImportoEuroCents) =>
      navigateToPaymentOutcomeCode({ fee }),
    loadTransactions: () =>
      dispatch(fetchTransactionsRequestWithExpBackoff({ start: 0 })),

    dispatchPaymentCompleteSuccessfully: (rptId: RptId) =>
      dispatch(
        paymentCompletedSuccess({
          kind: "COMPLETED",
          rptId,
          transaction: undefined
        })
      ),
    dispatchPaymentFailure: (
      outcomeCode: OutcomeCodesKey | undefined,
      paymentId: string
    ) => dispatch(paymentCompletedFailure({ outcomeCode, paymentId }))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(withLoadingSpinner(ConfirmPaymentMethodScreen)));
