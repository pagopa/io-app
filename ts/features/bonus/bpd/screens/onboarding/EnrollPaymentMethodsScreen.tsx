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
import { walletsSelector } from "../../../../../store/reducers/wallet/wallets";
import { Wallet } from "../../../../../types/pagopa";
import { FooterTwoButtons } from "../../../bonusVacanze/components/markdown/FooterTwoButtons";
import { PaymentMethodBpdList } from "../../components/PaymentMethodBpdList";

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
  potWallets: pot.Pot<ReadonlyArray<Wallet>, Error>
) =>
  pot.fold(
    potWallets,
    // TODO: handle error, loading with spinner if needed
    () => null,
    () => null,
    _ => null,
    _ => null,
    value => <PaymentMethodBpdList paymentList={value} />,
    value => <PaymentMethodBpdList paymentList={value} />,
    value => <PaymentMethodBpdList paymentList={value} />,
    value => <PaymentMethodBpdList paymentList={value} />
  );

/**
 * This screen allows the user to activate bpd on the payment methods already in the wallet
 */
const EnrollPaymentMethodsScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, continueStr, skip, title, body1, body2 } = loadLocales();
  return (
    <BaseScreenComponent goBack={false} headerTitle={headerTitle}>
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
        <FooterTwoButtons
          onRight={props.skip}
          onCancel={props.skip}
          rightText={continueStr}
          leftText={skip}
        />
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

const mapStateToProps = (state: GlobalState) => ({
  potWallets: walletsSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EnrollPaymentMethodsScreen);
