import { View } from "native-base";
import * as React from "react";
import * as pot from "italia-ts-commons/lib/pot";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationActions, NavigationNavigateAction } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { PaymentMethodRawList } from "../../../../../bonus/bpd/components/paymentMethodActivationToggle/list/PaymentMethodRawList";
import { GlobalState } from "../../../../../../store/reducers/types";
import { areAnyPaymentMethodsActiveSelector } from "../../../../../bonus/bpd/store/reducers/details/paymentMethods";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import {
  navigateToWalletTransactionsScreen,
  navigateToWalletHome
} from "../../../../../../store/actions/navigation";
import { creditCardWalletV1Selector } from "../../../../../../store/reducers/wallet/wallets";

type OwnProps = {
  navigateToWalletTransactionsScreen: (
    selectedWallet: ReadonlyArray<PaymentMethod>
  ) => NavigationNavigateAction;
  paymentMethods: ReadonlyArray<PaymentMethod>;
  title: string;
};

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  title: I18n.t("bonus.bpd.activateOnNewMethods.title"),
  body1: I18n.t("bonus.bpd.activateOnNewMethods.body1"),
  body2: I18n.t("bonus.bpd.activateOnNewMethods.body2"),
  skip: I18n.t("bonus.bpd.activateOnNewMethods.skip"),
  continueStr: I18n.t("global.buttons.continue")
});

/**
 * return a two button footer
 * left button is enabled when no payment methods are BPD active
 * right button button is enabled when at least one payment method is BPD active
 * @param props
 */

type NavigationProps = {
  navigateToWalletHome: () => void;
};

type NewProps = {
  paymentMethods: NavigationProps & Props;
};

type ExtendedProps = Props & NewProps;

const getFooter = (props: ExtendedProps) => {
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
    onPress: () =>
      props.navigateToWalletTransactionsScreen(props.paymentMethods),
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

const ActivateBpdOnNewPaymentMethodScreen: React.FunctionComponent<Props> = props => {
  const { title, body1, body2 } = loadLocales();

  const pm = props.wallets.find(
    method => method.idWallet === props.paymentMethods[0].idWallet
  );

  const navigateToWalletHomeScreen = () => props.navigateToWalletHome();

  const payload = {
    ...props,
    paymentMethods: {
      ...pm,
      navigateToWalletHome: navigateToWalletHomeScreen
    }
  };

  return (
    <BaseScreenComponent
      headerTitle={props.title}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={IOStyles.horizontalContentPadding}>
            <View spacer={true} large={true} />
            <H1>{title}</H1>
            <View spacer={true} large={true} />
            <Body>{body1}</Body>
            <View spacer={true} large={true} />
            <PaymentMethodRawList paymentList={props.paymentMethods} />
            <View spacer={true} large={true} />
            <Body>{body2}</Body>
          </View>
        </ScrollView>
        {getFooter(payload)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => dispatch(NavigationActions.back()),
  navigateToWalletTransactionsScreen: (
    selectedWallet: ReadonlyArray<PaymentMethod>
  ) => dispatch(navigateToWalletTransactionsScreen({ selectedWallet })),
  navigateToWalletHome: () => dispatch(navigateToWalletHome())
});

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  areAnyPaymentMethodsActive: areAnyPaymentMethodsActiveSelector(
    props.paymentMethods
  )(state),
  wallets: pot.getOrElse(creditCardWalletV1Selector(state), [])
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBpdOnNewPaymentMethodScreen);
