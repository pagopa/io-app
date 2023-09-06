/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */

import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Content } from "native-base";
import React, { useState } from "react";
import { Keyboard, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { connect } from "react-redux";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { Link } from "../../components/core/typography/Link";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { WalletParamsList } from "../../navigation/params/WalletParamsList";
import {
  navigateBack,
  navigateToWalletConfirmCardDetails
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import { CreditCard } from "../../types/pagopa";
import { ComponentProps } from "../../types/react";
import { useScreenReaderEnabled } from "../../utils/accessibility";

import { CreditCardDetector, SupportedBrand } from "../../utils/creditCard";
import { isExpired } from "../../utils/dates";
import { isTestEnv } from "../../utils/environment";
import { useLuhnValidation } from "../../utils/hooks/useLuhnValidation";
import {
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardState,
  CreditCardStateKeys,
  getCreditCardFromState,
  INITIAL_CARD_FORM_STATE,
  isValidCardHolder,
  isValidPan,
  isValidSecurityCode,
  MIN_PAN_DIGITS
} from "../../utils/input";
import { showToast } from "../../utils/showToast";
import { openWebUrl } from "../../utils/url";
import { acceptedPaymentMethodsFaqUrl } from "../../urls";

export type AddCardScreenNavigationParams = Readonly<{
  inPayment: O.Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  keyFrom?: string;
}>;

type OwnProps = IOStackNavigationRouteProps<
  WalletParamsList,
  "WALLET_ADD_CARD"
>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  creditCardForm: {
    height: 24,
    width: 24
  },
  verticalSpacing: {
    width: 16,
    flex: 0
  },
  whiteBg: {
    backgroundColor: IOColors.white
  },
  flex: {
    flex: 1
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.saveCard.contextualHelpTitle",
  body: "wallet.saveCard.contextualHelpContent"
};

const openSupportedCardsPage = (): void => {
  openWebUrl(acceptedPaymentMethodsFaqUrl, () =>
    showToast(I18n.t("wallet.alert.supportedCardPageLinkError"))
  );
};

const usePrimaryButtonPropsFromState = (
  state: CreditCardState,
  onNavigate: (card: CreditCard) => void,
  isHolderValid: boolean,
  isExpirationDateValid?: boolean
): ComponentProps<typeof FooterWithButtons>["leftButton"] => {
  const baseButtonProps = {
    block: true,
    primary: true,
    title: I18n.t("global.buttons.continue")
  };

  const { isCardNumberValid, isCvvValid } = useLuhnValidation(
    pipe(
      state.pan,
      O.getOrElse(() => "")
    ),
    pipe(
      state.securityCode,
      O.getOrElse(() => "")
    )
  );

  const card = getCreditCardFromState(state);

  return pipe(
    card,
    E.foldW(
      e => ({
        ...baseButtonProps,
        disabled: true,
        accessibilityRole: "button",
        accessibilityLabel: e
      }),
      c => ({
        ...baseButtonProps,
        disabled:
          !isCardNumberValid ||
          !isCvvValid ||
          !isHolderValid ||
          !isExpirationDateValid,
        onPress: () => {
          Keyboard.dismiss();
          onNavigate(c);
        }
      })
    )
  );
};

// return some(true) if the date is invalid or expired
// none if it can't be evaluated
const isCreditCardDateExpiredOrInvalid = (
  expireDate: O.Option<string>
): O.Option<boolean> =>
  pipe(
    expireDate,
    O.chain(date => {
      // split the date in two parts: month, year
      const splitted = date.split("/");
      if (splitted.length !== 2) {
        return O.none;
      }

      return O.some([splitted[0], splitted[1]]);
    }),
    O.chain(my => {
      // if the input is not in the required format mm/yy
      if (
        !CreditCardExpirationMonth.is(my[0]) ||
        !CreditCardExpirationYear.is(my[1])
      ) {
        return O.some(true);
      }
      return O.fromEither(isExpired(my[0], my[1]));
    })
  );

const maybeCreditCardValidOrExpired = (
  creditCard: CreditCardState
): O.Option<boolean> =>
  pipe(
    isCreditCardDateExpiredOrInvalid(creditCard.expirationDate),
    O.map(v => !v)
  );

const getAccessibilityLabels = (creditCard: CreditCardState) => ({
  cardHolder:
    O.isNone(creditCard.holder) || isValidCardHolder(creditCard.holder)
      ? I18n.t("wallet.dummyCard.accessibility.holder.base")
      : I18n.t("wallet.dummyCard.accessibility.holder.error"),
  pan:
    O.isNone(creditCard.pan) || isValidPan(creditCard.pan)
      ? I18n.t("wallet.dummyCard.accessibility.pan.base")
      : I18n.t("wallet.dummyCard.accessibility.pan.error", {
          minLength: MIN_PAN_DIGITS
        }),
  expirationDate:
    O.isNone(maybeCreditCardValidOrExpired(creditCard)) ||
    O.toUndefined(maybeCreditCardValidOrExpired(creditCard))
      ? I18n.t("wallet.dummyCard.accessibility.expirationDate.base")
      : I18n.t("wallet.dummyCard.accessibility.expirationDate.error"),
  securityCode3D:
    O.isNone(creditCard.securityCode) ||
    isValidSecurityCode(creditCard.securityCode)
      ? I18n.t("wallet.dummyCard.accessibility.securityCode.3D.base")
      : I18n.t("wallet.dummyCard.accessibility.securityCode.3D.error"),
  securityCode4D:
    O.isNone(creditCard.securityCode) ||
    isValidSecurityCode(creditCard.securityCode)
      ? I18n.t("wallet.dummyCard.accessibility.securityCode.4D.base")
      : I18n.t("wallet.dummyCard.accessibility.securityCode.4D.error")
});

const AddCardScreen: React.FC<Props> = props => {
  const [creditCard, setCreditCard] = useState<CreditCardState>(
    INITIAL_CARD_FORM_STATE
  );

  const isCardHolderValid = O.isNone(creditCard.holder)
    ? undefined
    : isValidCardHolder(creditCard.holder);

  const isCardExpirationDateValid = O.toUndefined(
    maybeCreditCardValidOrExpired(creditCard)
  );

  const detectedBrand: SupportedBrand = CreditCardDetector.validate(
    creditCard.pan
  );

  const { isCardNumberValid, isCvvValid } = useLuhnValidation(
    pipe(
      creditCard.pan,
      O.getOrElse(() => "")
    ),
    pipe(
      creditCard.securityCode,
      O.getOrElse(() => "")
    )
  );
  const isCardCvvValid = pipe(
    creditCard.securityCode,
    O.getOrElse(() => "")
  )
    ? isCvvValid
    : undefined;

  const isCreditCardValid = O.isNone(creditCard.pan)
    ? undefined
    : isCardNumberValid;

  const updateState = (key: CreditCardStateKeys, value: string) => {
    setCreditCard({
      ...creditCard,
      [key]: O.fromPredicate((value: string) => value.length > 0)(value)
    });
  };

  const secondaryButtonProps = {
    block: true,
    bordered: true,
    onPress: props.navigateBack,
    title: I18n.t("global.buttons.back")
  };

  const isScreenReaderEnabled = !useScreenReaderEnabled();
  const placeholders = isScreenReaderEnabled
    ? {
        placeholderCard: I18n.t("wallet.dummyCard.values.pan"),
        placeholderHolder: I18n.t("wallet.dummyCard.values.holder"),
        placeholderDate: I18n.t("wallet.dummyCard.values.expirationDate"),
        placeholderSecureCode: I18n.t(
          detectedBrand.cvvLength === 4
            ? "wallet.dummyCard.values.securityCode4D"
            : "wallet.dummyCard.values.securityCode"
        )
      }
    : {};

  const accessibilityLabels = getAccessibilityLabels(creditCard);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.addCardTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet_methods", "wallet_methods_security"]}
    >
      <SafeAreaView style={styles.flex}>
        <ScrollView
          bounces={false}
          style={styles.whiteBg}
          keyboardShouldPersistTaps="handled"
        >
          <Content scrollEnabled={false}>
            <LabelledItem
              label={I18n.t("wallet.dummyCard.labels.holder.label")}
              description={
                O.isNone(creditCard.holder) ||
                isValidCardHolder(creditCard.holder)
                  ? I18n.t("wallet.dummyCard.labels.holder.description.base")
                  : I18n.t("wallet.dummyCard.labels.holder.description.error")
              }
              icon="profile"
              isValid={isCardHolderValid}
              accessibilityLabel={accessibilityLabels.cardHolder}
              inputProps={{
                value: pipe(
                  creditCard.holder,
                  O.getOrElse(() => "")
                ),
                placeholder: placeholders.placeholderHolder,
                autoCapitalize: "words",
                keyboardType: "default",
                returnKeyType: "done",
                onChangeText: (value: string) => updateState("holder", value)
              }}
              overrideBorderColor={getColorFromInputValidatorState(
                isCardHolderValid
              )}
              testID={"cardHolder"}
            />

            <VSpacer size={16} />

            <LabelledItem
              label={I18n.t("wallet.dummyCard.labels.pan")}
              icon={detectedBrand.iconForm}
              imageStyle={styles.creditCardForm}
              isValid={isCreditCardValid}
              inputMaskProps={{
                value: pipe(
                  creditCard.pan,
                  O.getOrElse(() => "")
                ),
                placeholder: placeholders.placeholderCard,
                keyboardType: "numeric",
                returnKeyType: "done",
                maxLength: 23,
                type: "custom",
                options: {
                  mask: "9999 9999 9999 9999 999",
                  getRawValue: value1 => value1.replace(/ /g, "")
                },
                includeRawValueInChangeText: true,
                onChangeText: (_, value) => {
                  if (value !== undefined) {
                    updateState("pan", value);
                  }
                }
              }}
              overrideBorderColor={getColorFromInputValidatorState(
                isCreditCardValid
              )}
              accessibilityLabel={accessibilityLabels.pan}
              testID={"pan"}
            />

            <VSpacer size={16} />
            <Grid>
              <Col>
                <LabelledItem
                  label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                  icon="calendar"
                  accessibilityLabel={accessibilityLabels.expirationDate}
                  isValid={isCardExpirationDateValid}
                  inputMaskProps={{
                    value: pipe(
                      creditCard.expirationDate,
                      O.getOrElse(() => "")
                    ),
                    placeholder: placeholders.placeholderDate,
                    keyboardType: "numeric",
                    returnKeyType: "done",
                    type: "custom",
                    options: { mask: "99/99" },
                    includeRawValueInChangeText: true,
                    onChangeText: value => updateState("expirationDate", value)
                  }}
                  overrideBorderColor={getColorFromInputValidatorState(
                    isCardExpirationDateValid
                  )}
                  testID={"expirationDate"}
                />
              </Col>
              <Col style={styles.verticalSpacing} />
              <Col>
                <LabelledItem
                  label={I18n.t(
                    detectedBrand.cvvLength === 4
                      ? "wallet.dummyCard.labels.securityCode4D"
                      : "wallet.dummyCard.labels.securityCode"
                  )}
                  icon="locked"
                  isValid={isCardCvvValid}
                  accessibilityLabel={
                    detectedBrand.cvvLength === 4
                      ? accessibilityLabels.securityCode4D
                      : accessibilityLabels.securityCode3D
                  }
                  inputMaskProps={{
                    value: pipe(
                      creditCard.securityCode,
                      O.getOrElse(() => "")
                    ),
                    placeholder: placeholders.placeholderSecureCode,
                    returnKeyType: "done",
                    maxLength: 4,
                    type: "custom",
                    options: { mask: "9999" },
                    keyboardType: "numeric",
                    secureTextEntry: true,
                    includeRawValueInChangeText: true,
                    onChangeText: value => updateState("securityCode", value)
                  }}
                  overrideBorderColor={getColorFromInputValidatorState(
                    isCardCvvValid
                  )}
                  testID={"securityCode"}
                />
              </Col>
            </Grid>

            <VSpacer size={16} />

            <Link
              accessibilityRole="link"
              accessibilityLabel={I18n.t("wallet.openAcceptedCardsPageCTA")}
              onPress={openSupportedCardsPage}
            >
              {I18n.t("wallet.openAcceptedCardsPageCTA")}
            </Link>
          </Content>
        </ScrollView>
        <SectionStatusComponent sectionKey={"credit_card"} />
        <FooterWithButtons
          type="TwoButtonsInlineHalf"
          leftButton={secondaryButtonProps}
          rightButton={usePrimaryButtonPropsFromState(
            creditCard,
            props.navigateToConfirmCardDetailsScreen,
            isValidCardHolder(creditCard.holder),
            O.toUndefined(maybeCreditCardValidOrExpired(creditCard))
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch, props: OwnProps) => ({
  navigateBack: () => navigateBack(),
  navigateToConfirmCardDetailsScreen: (creditCard: CreditCard) =>
    navigateToWalletConfirmCardDetails({
      creditCard,
      inPayment: props.route.params.inPayment,
      keyFrom: props.route.params.keyFrom
    })
});

export default connect(mapStateToProps, mapDispatchToProps)(AddCardScreen);
// keep encapsulation strong
export const testableAddCardScreen = isTestEnv
  ? { isCreditCardDateExpiredOrInvalid }
  : undefined;

function getColorFromInputValidatorState(
  isCreditCardValid: boolean | undefined
): string | undefined {
  return isCreditCardValid === undefined
    ? undefined
    : isCreditCardValid
    ? IOColors.green
    : IOColors.red;
}
