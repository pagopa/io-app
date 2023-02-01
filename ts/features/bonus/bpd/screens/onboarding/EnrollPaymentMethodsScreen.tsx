import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { PaymentMethod } from "../../../../../types/pagopa";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { PaymentMethodGroupedList } from "../../components/paymentMethodActivationToggle/list/PaymentMethodGroupedList";
import { paymentMethodsWithActivationStatusSelector } from "../../store/reducers/details/combiner";
import { areAnyPaymentMethodsActiveSelector } from "../../store/reducers/details/paymentMethods";

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
 * left button is enabled when no payment methods are BPD active
 * right button button is enabled when at least one payment method is BPD active
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
            <VSpacer size={24} />
            <H1>{title}</H1>
            <VSpacer size={40} />
            <Body>{body1}</Body>
            <VSpacer size={24} />
            {renderPaymentMethod(props.potWallets)}
            <VSpacer size={24} />
            <Body>{body2}</Body>
          </View>
        </ScrollView>
        {getFooter(props)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({
  skip: () => {
    navigateToWalletHome();
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
