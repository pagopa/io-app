/**
 * Screen for entering the credit card details
 * (holder, pan, cvc, expiration date)
 */
import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { AmountInEuroCents, RptId } from "italia-pagopa-commons/lib/pagopa";
import { Content, View } from "native-base";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";
import {
  NavigationInjectedProps,
  NavigationNavigateAction
} from "react-navigation";
import { connect } from "react-redux";
import { PaymentRequestsGetResponse } from "../../../definitions/backend/PaymentRequestsGetResponse";
import { LabelledItem } from "../../components/LabelledItem";
import BaseScreenComponent, {
  ContextualHelpPropsMarkdown
} from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import { navigateToWalletConfirmCardDetails } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { addWalletCreditCardInit } from "../../store/actions/wallet/wallets";
import variables from "../../theme/variables";
import { CreditCard } from "../../types/pagopa";
import { ComponentProps } from "../../types/react";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan,
  isValidPan,
  isValidExpirationDate,
  isValidSecurityCode
} from "../../utils/input";

import { CreditCardDetector, SupportedBrand } from "../../utils/creditCard";
import { GlobalState } from "../../store/reducers/types";
import { profileNameSurnameSelector } from "../../store/reducers/profile";
import { attachmentTypeConfigurationNoScreenshot } from "../../boot/configureInstabug";
import { Link } from "../../components/core/typography/Link";
import SectionStatusComponent from "../../components/SectionStatusComponent";
import { openWebUrl } from "../../utils/url";
import { showToast } from "../../utils/showToast";
import { useIOBottomSheet } from "../../utils/bottomSheet";
import { Body } from "../../components/core/typography/Body";

type NavigationParams = Readonly<{
  inPayment: Option<{
    rptId: RptId;
    initialAmount: AmountInEuroCents;
    verifica: PaymentRequestsGetResponse;
    idPayment: string;
  }>;
  keyFrom?: string;
}>;

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

type State = Readonly<{
  pan: Option<string>;
  expirationDate: Option<string>;
  securityCode: Option<string>;
  holder: Option<string>;
}>;

type StateKeys = "pan" | "expirationDate" | "securityCode" | "holder";

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

  whiteBg: {
    backgroundColor: variables.colorWhite
  }
});

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "wallet.saveCard.contextualHelpTitle",
  body: "wallet.saveCard.contextualHelpContent"
};

const INITIAL_STATE: State = {
  pan: none,
  expirationDate: none,
  securityCode: none,
  holder: none
};

function getCardFromState(state: State): Option<CreditCard> {
  const { pan, expirationDate, securityCode, holder } = state;
  if (
    pan.isNone() ||
    expirationDate.isNone() ||
    securityCode.isNone() ||
    holder.isNone()
  ) {
    return none;
  }

  const [expirationMonth, expirationYear] = expirationDate.value.split("/");

  if (!CreditCardPan.is(pan.value)) {
    // invalid pan
    return none;
  }

  if (
    !CreditCardExpirationMonth.is(expirationMonth) ||
    !CreditCardExpirationYear.is(expirationYear)
  ) {
    // invalid date
    return none;
  }

  if (!CreditCardCVC.is(securityCode.value)) {
    // invalid cvc
    return none;
  }

  const card: CreditCard = {
    pan: pan.value,
    holder: holder.value,
    expireMonth: expirationMonth,
    expireYear: expirationYear,
    securityCode: securityCode.value
  };

  return some(card);
}

const acceptedCardsPageURL: string = "https://io.italia.it/metodi-pagamento";

const primaryButtonPropsFromState = (
  state: State,
  onNavigate: (card: CreditCard) => NavigationNavigateAction
): ComponentProps<typeof FooterWithButtons>["leftButton"] => {
  const baseButtonProps = {
    block: true,
    primary: true,
    title: I18n.t("global.buttons.continue")
  };
  const maybeCard = getCardFromState(state);
  if (maybeCard.isSome()) {
    return {
      ...baseButtonProps,
      disabled: false,
      onPress: () => onNavigate(maybeCard.value)
    };
  } else {
    return {
      ...baseButtonProps,
      disabled: true,
      onPress: () => undefined
    };
  }
};

const AddCardScreen: React.FC<Props> = props => {
  const [state, setState] = useState<State>({
    ...INITIAL_STATE,
    holder: fromNullable(props.profileNameSurname)
  });

  const { present } = useIOBottomSheet(
    <Body>{I18n.t("wallet.missingDataText")}</Body>,
    I18n.t("wallet.missingDataCTA"),
    260
  );

  const openSupportedCardsPage = (): void => {
    openWebUrl(acceptedCardsPageURL, () =>
      showToast(I18n.t("wallet.alert.supportedCardPageLinkError"))
    );
  };

  const detectedBrand: SupportedBrand = CreditCardDetector.validate(state.pan);

  const updateState = (key: StateKeys, value: string) =>
    setState({
      ...state,
      [key]: fromNullable(value)
    });

  return (
    <BaseScreenComponent
      reportAttachmentTypes={attachmentTypeConfigurationNoScreenshot}
      goBack={true}
      headerTitle={I18n.t("wallet.addCardTitle")}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["wallet_methods", "wallet_methods_security"]}
    >
      <ScrollView
        bounces={false}
        style={styles.whiteBg}
        keyboardShouldPersistTaps="handled"
      >
        <Content scrollEnabled={false}>
          <LabelledItem
            type={"text"}
            label={I18n.t("wallet.dummyCard.labels.holder")}
            icon="io-titolare"
            isValid={state.holder.getOrElse("") === "" ? undefined : true}
            inputProps={{
              value: state.holder.getOrElse(""),
              placeholder: I18n.t("wallet.dummyCard.values.holder"),
              autoCapitalize: "words",
              keyboardType: "default",
              returnKeyType: "done",
              onChangeText: (value: string) => updateState("holder", value)
            }}
          />

          <View spacer={true} />

          <LabelledItem
            type={"masked"}
            label={I18n.t("wallet.dummyCard.labels.pan")}
            icon={detectedBrand.iconForm}
            iconStyle={styles.creditCardForm}
            isValid={isValidPan(state.pan)}
            inputMaskProps={{
              value: state.pan.getOrElse(""),
              placeholder: I18n.t("wallet.dummyCard.values.pan"),
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
          />

          <View spacer={true} />
          <Grid>
            <Col>
              <LabelledItem
                type={"masked"}
                label={I18n.t("wallet.dummyCard.labels.expirationDate")}
                icon="io-calendario"
                isValid={isValidExpirationDate(state.expirationDate)}
                inputMaskProps={{
                  value: state.expirationDate.getOrElse(""),
                  placeholder: I18n.t("wallet.dummyCard.values.expirationDate"),
                  keyboardType: "numeric",
                  returnKeyType: "done",
                  type: "custom",
                  options: { mask: "99/99" },
                  includeRawValueInChangeText: true,
                  onChangeText: value => updateState("expirationDate", value)
                }}
              />
            </Col>
            <Col style={styles.verticalSpacing} />
            <Col>
              <LabelledItem
                type={"masked"}
                label={I18n.t(
                  detectedBrand.cvvLength === 4
                    ? "wallet.dummyCard.labels.securityCode4D"
                    : "wallet.dummyCard.labels.securityCode"
                )}
                icon="io-lucchetto"
                isValid={isValidSecurityCode(state.securityCode)}
                inputMaskProps={{
                  value: state.securityCode.getOrElse(""),
                  placeholder: I18n.t(
                    detectedBrand.cvvLength === 4
                      ? "wallet.dummyCard.values.securityCode4D"
                      : "wallet.dummyCard.values.securityCode"
                  ),
                  returnKeyType: "done",
                  maxLength: 4,
                  type: "custom",
                  options: { mask: "9999" },
                  keyboardType: "numeric",
                  secureTextEntry: true,
                  includeRawValueInChangeText: true,
                  onChangeText: value => updateState("securityCode", value)
                }}
              />
            </Col>
          </Grid>

          <View spacer={true} />

          <Link onPress={present}>{I18n.t("wallet.missingDataCTA")}</Link>

          <View spacer />

          <Link onPress={openSupportedCardsPage}>
            {I18n.t("wallet.openAcceptedCardsPageCTA")}
          </Link>
        </Content>
      </ScrollView>
      <SectionStatusComponent sectionKey={"credit_card"} />
      <FooterWithButtons
        type="TwoButtonsInlineHalf"
        leftButton={props.secondaryButtonProps}
        rightButton={primaryButtonPropsFromState(
          state,
          props.navigateToConfirmCardDetailsScreen
        )}
      />
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  profileNameSurname: profileNameSurnameSelector(state),
  secondaryButtonProps: {
    block: true,
    bordered: true,
    onPress: () => props.navigation.goBack(),
    title: I18n.t("global.buttons.back")
  }
});

const mapDispatchToProps = (dispatch: Dispatch, props: OwnProps) => ({
  addWalletCreditCardInit: () => dispatch(addWalletCreditCardInit()),
  navigateToConfirmCardDetailsScreen: (creditCard: CreditCard) =>
    dispatch(
      navigateToWalletConfirmCardDetails({
        creditCard,
        inPayment: props.navigation.getParam("inPayment"),
        keyFrom: props.navigation.getParam("keyFrom")
      })
    )
});

export default connect(mapStateToProps, mapDispatchToProps)(AddCardScreen);
