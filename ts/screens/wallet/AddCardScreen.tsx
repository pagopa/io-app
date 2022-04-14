/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */

import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import {
  fromEither,
  fromPredicate,
  isNone,
  isSome,
  none,
  Option,
  some
} from "fp-ts/lib/Option";
import { Content, View } from "native-base";
import React, { useState } from "react";
import { Keyboard, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import { NavigationStackScreenProps } from "react-navigation-stack";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import ButtonDefaultOpacity from "../../components/ButtonDefaultOpacity";
import { Body } from "../../components/core/typography/Body";
import { Label } from "../../components/core/typography/Label";
import { Link } from "../../components/core/typography/Link";
import { IOColors } from "../../components/core/variables/IOColors";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import { BlockButtonProps } from "../../components/ui/BlockButtons";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import { walletAddCoBadgeStart } from "../../features/wallet/onboarding/cobadge/store/actions";
import I18n from "../../i18n";
import {
  navigateBack,
  navigateToWalletConfirmCardDetails
} from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { CreditCard } from "../../types/pagopa";
import { ComponentProps } from "../../types/react";
import { useScreenReaderEnabled } from "../../utils/accessibility";
import { useIOBottomSheetModal } from "../../utils/hooks/bottomSheet";

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

export type AddCardScreenNavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  keyFrom?: string;
}>;

type OwnProps = NavigationStackScreenProps<AddCardScreenNavigationParams>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  noBottomLine: {
    borderBottomWidth: 0
  },

  addCardImage: {
    width: 60,
    height: 45,
    resizeMode: "contain",
    marginTop: 5
  },

  creditCardForm: {
    height: 24,
    width: 24
  },

  verticalSpacing: {
    width: 16,
    flex: 0
  },
  button: {
    width: "100%",
    borderColor: IOColors.blue
  },
  whiteBg: {
    backgroundColor: variables.colorWhite
  },
  flex: {
    flex: 1
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.saveCard.contextualHelpTitle",
  body: "wallet.saveCard.contextualHelpContent"
};

const acceptedCardsPageURL: string = "https://io.italia.it/metodi-pagamento";

const openSupportedCardsPage = (): void => {
  openWebUrl(acceptedCardsPageURL, () =>
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
    state.pan.getOrElse(""),
    state.securityCode.getOrElse("")
  );

  const card = getCreditCardFromState(state);

  return card.fold<BlockButtonProps>(
    (e: string | undefined) => ({
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
  );
};

// return some(true) if the date is invalid or expired
// none if it can't be evaluated
const isCreditCardDateExpiredOrInvalid = (
  expireDate: Option<string>
): Option<boolean> =>
  expireDate
    .chain(date => {
      // split the date in two parts: month, year
      const splitted = date.split("/");
      if (splitted.length !== 2) {
        return none;
      }

      return some([splitted[0], splitted[1]]);
    })
    .chain(my => {
      // if the input is not in the required format mm/yy
      if (
        !CreditCardExpirationMonth.is(my[0]) ||
        !CreditCardExpirationYear.is(my[1])
      ) {
        return some(true);
      }
      return fromEither(isExpired(my[0], my[1]));
    });

const maybeCreditCardValidOrExpired = (
  creditCard: CreditCardState
): Option<boolean> =>
  isCreditCardDateExpiredOrInvalid(creditCard.expirationDate).map(v => !v);

const getAccessibilityLabels = (creditCard: CreditCardState) => ({
  cardHolder:
    isNone(creditCard.holder) || isValidCardHolder(creditCard.holder)
      ? I18n.t("wallet.dummyCard.accessibility.holder.base")
      : I18n.t("wallet.dummyCard.accessibility.holder.error"),
  pan:
    isNone(creditCard.pan) || isValidPan(creditCard.pan)
      ? I18n.t("wallet.dummyCard.accessibility.pan.base")
      : I18n.t("wallet.dummyCard.accessibility.pan.error", {
          minLength: MIN_PAN_DIGITS
        }),
  expirationDate:
    isNone(maybeCreditCardValidOrExpired(creditCard)) ||
    maybeCreditCardValidOrExpired(creditCard).toUndefined()
      ? I18n.t("wallet.dummyCard.accessibility.expirationDate.base")
      : I18n.t("wallet.dummyCard.accessibility.expirationDate.error"),
  securityCode3D:
    isNone(creditCard.securityCode) ||
    isValidSecurityCode(creditCard.securityCode)
      ? I18n.t("wallet.dummyCard.accessibility.securityCode.3D.base")
      : I18n.t("wallet.dummyCard.accessibility.securityCode.3D.error"),
  securityCode4D:
    isNone(creditCard.securityCode) ||
    isValidSecurityCode(creditCard.securityCode)
      ? I18n.t("wallet.dummyCard.accessibility.securityCode.4D.base")
      : I18n.t("wallet.dummyCard.accessibility.securityCode.4D.error")
});

const AddCardScreen: React.FC<Props> = props => {
  const [creditCard, setCreditCard] = useState<CreditCardState>(
    INITIAL_CARD_FORM_STATE
  );
  const inPayment = props.navigation.getParam("inPayment");

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <>
      <Body>{I18n.t("wallet.missingDataText.body")}</Body>
      <View spacer={true} large />
      <ButtonDefaultOpacity
        style={styles.button}
        bordered={true}
        onPress={() => {
          dismiss();
          props.startAddCobadgeWorkflow();
        }}
        onPressWithGestureHandler={true}
      >
        <Label>{I18n.t("wallet.missingDataText.cta")}</Label>
      </ButtonDefaultOpacity>
    </>,
    I18n.t("wallet.missingDataCTA"),
    300
  );

  const detectedBrand: SupportedBrand = CreditCardDetector.validate(
    creditCard.pan
  );

  const { isCardNumberValid, isCvvValid } = useLuhnValidation(
    creditCard.pan.getOrElse(""),
    creditCard.securityCode.getOrElse("")
  );

  const updateState = (key: CreditCardStateKeys, value: string) => {
    setCreditCard({
      ...creditCard,
      [key]: fromPredicate((value: string) => value.length > 0)(value)
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
                isNone(creditCard.holder) ||
                isValidCardHolder(creditCard.holder)
                  ? I18n.t("wallet.dummyCard.labels.holder.description.base")
                  : I18n.t("wallet.dummyCard.labels.holder.description.error")
              }
              icon="io-titolare"
              isValid={
                isNone(creditCard.holder)
                  ? undefined
                  : isValidCardHolder(creditCard.holder)
              }
              accessibilityLabel={accessibilityLabels.cardHolder}
              inputProps={{
                value: creditCard.holder.getOrElse(""),
                placeholder: placeholders.placeholderHolder,
                autoCapitalize: "words",
                keyboardType: "default",
                returnKeyType: "done",
                onChangeText: (value: string) => updateState("holder", value)
              }}
              testID={"cardHolder"}
            />

            <View spacer={true} />

            <LabelledItem
              label={I18n.t("wallet.dummyCard.labels.pan")}
              icon={detectedBrand.iconForm}
              iconStyle={styles.creditCardForm}
              isValid={isNone(creditCard.pan) ? undefined : isCardNumberValid}
              inputMaskProps={{
                value: creditCard.pan.getOrElse(""),
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
              accessibilityLabel={accessibilityLabels.pan}
              testID={"pan"}
            />

            <View spacer={true} />
            <Grid>
              <Col>
                <LabelledItem
                  label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                  icon="io-calendario"
                  accessibilityLabel={accessibilityLabels.expirationDate}
                  isValid={maybeCreditCardValidOrExpired(
                    creditCard
                  ).toUndefined()}
                  inputMaskProps={{
                    value: creditCard.expirationDate.getOrElse(""),
                    placeholder: placeholders.placeholderDate,
                    keyboardType: "numeric",
                    returnKeyType: "done",
                    type: "custom",
                    options: { mask: "99/99" },
                    includeRawValueInChangeText: true,
                    onChangeText: value => updateState("expirationDate", value)
                  }}
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
                  icon="io-lucchetto"
                  isValid={
                    creditCard.securityCode.getOrElse("")
                      ? isCvvValid
                      : undefined
                  }
                  accessibilityLabel={
                    detectedBrand.cvvLength === 4
                      ? accessibilityLabels.securityCode4D
                      : accessibilityLabels.securityCode3D
                  }
                  inputMaskProps={{
                    value: creditCard.securityCode.getOrElse(""),
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
                  testID={"securityCode"}
                />
              </Col>
            </Grid>

            {!isSome(inPayment) && (
              <>
                <View spacer={true} />
                <Link
                  accessibilityRole="link"
                  accessibilityLabel={I18n.t("wallet.missingDataCTA")}
                  onPress={present}
                >
                  {I18n.t("wallet.missingDataCTA")}
                </Link>
              </>
            )}
            <View spacer />

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
            maybeCreditCardValidOrExpired(creditCard).toUndefined()
          )}
        />
        {bottomSheet}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  startAddCobadgeWorkflow: () => dispatch(walletAddCoBadgeStart(undefined)),
  navigateBack: () => navigateBack(),
  navigateToConfirmCardDetailsScreen: (creditCard: CreditCard) =>
    navigateToWalletConfirmCardDetails({
      creditCard,
      inPayment: props.navigation.getParam("inPayment"),
      keyFrom: props.navigation.getParam("keyFrom")
    })
});

export default connect(mapStateToProps, mapDispatchToProps)(AddCardScreen);
// keep encapsulation strong
export const testableAddCardScreen = isTestEnv
  ? { isCreditCardDateExpiredOrInvalid }
  : undefined;
