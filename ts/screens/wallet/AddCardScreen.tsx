/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */

import {
  ContentWrapper,
  FooterWithButtons,
  HSpacer,
  IOColors,
  IOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { Route, useRoute } from "@react-navigation/native";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useState } from "react";
import {
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from "react-native";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { LabelledItem } from "../../components/LabelledItem";
import SectionStatusComponent from "../../components/SectionStatus";
import { Link } from "../../components/core/typography/Link";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import { navigateToWalletConfirmCardDetails } from "../../store/actions/navigation";
import { CreditCard } from "../../types/pagopa";
import { ComponentProps } from "../../types/react";
import { acceptedPaymentMethodsFaqUrl } from "../../urls";
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
  INITIAL_CARD_FORM_STATE,
  MIN_PAN_DIGITS,
  getCreditCardFromState,
  isValidCardHolder,
  isValidPan,
  isValidSecurityCode
} from "../../utils/input";
import { openWebUrl } from "../../utils/url";

export type AddCardScreenNavigationParams = Readonly<{
  inPayment: O.Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  keyFrom?: string;
}>;

const styles = StyleSheet.create({
  creditCardForm: {
    height: 24,
    width: 24
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
    IOToast.error(I18n.t("wallet.alert.supportedCardPageLinkError"))
  );
};

const usePrimaryButtonPropsFromState = (
  state: CreditCardState,
  onNavigate: (card: CreditCard) => void,
  isHolderValid: boolean,
  isExpirationDateValid?: boolean
): ComponentProps<typeof FooterWithButtons>["primary"] => {
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
        type: "Solid",
        buttonProps: {
          disabled: true,
          accessibilityLabel: e,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onPress: () => {},
          label: I18n.t("global.buttons.continue")
        }
      }),
      c => ({
        type: "Solid",
        buttonProps: {
          disabled:
            !isCardNumberValid ||
            !isCvvValid ||
            !isHolderValid ||
            !isExpirationDateValid,
          onPress: () => {
            Keyboard.dismiss();
            onNavigate(c);
          },
          accessibilityLabel: I18n.t("global.buttons.continue"),
          label: I18n.t("global.buttons.continue")
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

const AddCardScreen: React.FC = () => {
  const [creditCard, setCreditCard] = useState<CreditCardState>(
    INITIAL_CARD_FORM_STATE
  );

  const navigation = useIONavigation();
  const { inPayment, keyFrom } =
    useRoute<Route<"WALLET_ADD_CARD", AddCardScreenNavigationParams>>().params;
  const navigateToConfirmCardDetailsScreen = (creditCard: CreditCard) =>
    navigateToWalletConfirmCardDetails({
      creditCard,
      inPayment,
      keyFrom
    });

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
          <ContentWrapper>
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

            <View style={{ flexDirection: "row" }}>
              <View style={{ flexGrow: 1 }}>
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
              </View>
              <HSpacer size={16} />
              <View style={{ flexGrow: 1 }}>
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
              </View>
            </View>

            <VSpacer size={16} />

            <Link
              accessibilityRole="link"
              accessibilityLabel={I18n.t("wallet.openAcceptedCardsPageCTA")}
              onPress={openSupportedCardsPage}
            >
              {I18n.t("wallet.openAcceptedCardsPageCTA")}
            </Link>
          </ContentWrapper>
        </ScrollView>
        <SectionStatusComponent sectionKey={"credit_card"} />
      </SafeAreaView>
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        primary={{
          type: "Outline",
          buttonProps: {
            label: I18n.t("global.buttons.back"),
            color: "primary",
            accessibilityLabel: I18n.t("global.buttons.back"),
            onPress: navigation.goBack
          }
        }}
        secondary={usePrimaryButtonPropsFromState(
          creditCard,
          navigateToConfirmCardDetailsScreen,
          isValidCardHolder(creditCard.holder),
          O.toUndefined(maybeCreditCardValidOrExpired(creditCard))
        )}
      />
    </BaseScreenComponent>
  );
};

export default AddCardScreen;

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
