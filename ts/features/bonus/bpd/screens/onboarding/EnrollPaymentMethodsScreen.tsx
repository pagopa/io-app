import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { GlobalState } from "../../../../../store/reducers/types";
import { PaymentMethod } from "../../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { PaymentMethodGroupedList } from "../../components/paymentMethodActivationToggle/list/PaymentMethodGroupedList";
import { paymentMethodsWithActivationStatusSelector } from "../../store/reducers/details/combiner";
import { areAnyPaymentMethodsActiveSelector } from "../../store/reducers/details/paymentMethods";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  continueStr: I18n.t("global.buttons.continue"),
  skip: I18n.t("global.buttons.skip"),
  title: I18n.t("bonus.bpd.onboarding.enrollPaymentMethod.title"),
  body1: I18n.t("bonus.bpd.onboarding.enrollPaymentMethod.body1"),
  body2: I18n.t("bonus.bpd.onboarding.enrollPaymentMethod.body2")
});

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const renderPaymentMethod = (
  potWallets: pot.Pot<ReadonlyArray<PaymentMethod>, Error>
) =>
  pot.fold(
    potWallets,
    // TODO: handle error, loading with spinner if needed
    () => null,
    () => null,
    _ => null,
    _ => null,
    value => <PaymentMethodGroupedList paymentList={value} />,
    value => <PaymentMethodGroupedList paymentList={value} />,
    value => <PaymentMethodGroupedList paymentList={value} />,
    value => <PaymentMethodGroupedList paymentList={value} />
  );

/**
 * return a two button footer
 * left button is enabled when no payment methods are active
 * right button button is enabled when at least one payment method is active
 * @param props
 */
const getFooter = (props: Props) => {
  const { continueStr, skip } = loadLocales();
  const notNowButtonProps = {
    primary: false,
    bordered: true,
    disabled: props.areAnyPaymentMethodsActive,
    onPress: props.skip,
    title: skip
  };
  const continueButtonProps = {
    block: true,
    primary: true,
    disabled: !props.areAnyPaymentMethodsActive,
    onPress: props.skip,
    title: continueStr
  };
  return (
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={notNowButtonProps}
      rightButton={continueButtonProps}
    />
  );
};

/**
 * This screen allows the user to activate bpd on the payment methods already in the wallet
 */
const EnrollPaymentMethodsScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body1, body2 } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={false}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <View spacer={true} large={true} />
            <H1>{title}</H1>
            <View spacer={true} extralarge={true} />
            <Body>{body1}</Body>
            <View spacer={true} large={true} />
            {renderPaymentMethod(props.potWallets)}
            <View spacer={true} large={true} />
            <Body>{body2}</Body>
          </View>
        </ScrollView>
        {getFooter(props)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => {
    dispatch(navigateToWalletHome());
    dispatch(navigationHistoryPop(1));
  }
});

const mapStateToProps = (state: GlobalState) => {
  const potWallets = paymentMethodsWithActivationStatusSelector(state);
  return {
    potWallets,
    areAnyPaymentMethodsActive: areAnyPaymentMethodsActiveSelector(
      pot.getOrElse(potWallets, [])
    )(state)
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EnrollPaymentMethodsScreen);
