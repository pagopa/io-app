import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as pot from "italia-ts-commons/lib/pot";
import { fromNullable } from "fp-ts/lib/Option";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { PaymentMethodRawList } from "../../../../../bonus/bpd/components/paymentMethodActivationToggle/list/PaymentMethodRawList";
import { GlobalState } from "../../../../../../store/reducers/types";
import { bpdPaymentMethodActivationSelector } from "../../../../../bonus/bpd/store/reducers/details/paymentMethods";
import { getPaymentMethodHash } from "../../../../../../utils/paymentMethod";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";

type OwnProps = {
  paymentMethods: ReadonlyArray<PaymentMethod>;
  title: string;
};

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps &
  Pick<React.ComponentProps<typeof BaseScreenComponent>, "contextualHelp">;

const loadLocales = () => ({
  title: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.title"),
  body1: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.body1"),
  body2: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.body2"),
  skip: I18n.t("wallet.onboarding.bancomat.bpd.activateNew.skip"),
  continueStr: I18n.t("global.buttons.continue")
});

/**
 * return a two button footer
 * left button is enabled when no payment methods are active
 * right button button is enabled when at least one payment method is active
 * @param props
 */
const getFooter = (props: Props) => {
  const { continueStr, skip } = loadLocales();
  const { paymentMethods, bpdPaymentMethodsActivation } = props;
  const paymentMethodsHash = paymentMethods.map(getPaymentMethodHash);
  const atLeastOneActive = paymentMethodsHash.some(pmh =>
    fromNullable(pmh)
      .mapNullable(h => bpdPaymentMethodsActivation[h])
      .map(potActivation =>
        pot.getOrElse(
          pot.map(potActivation, p => p.activationStatus === "active"),
          false
        )
      )
      .getOrElse(false)
  );
  const notNowButtonProps = {
    primary: false,
    bordered: true,
    disabled: atLeastOneActive,
    onPress: props.skip,
    title: skip
  };
  const continueButtonProps = {
    block: true,
    primary: true,
    disabled: !atLeastOneActive,
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

const ActivateBpdOnNewPaymentMethodScreen: React.FunctionComponent<Props> = props => {
  const { title, body1, body2 } = loadLocales();

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
        {getFooter(props)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => dispatch(NavigationActions.back())
});

const mapStateToProps = (state: GlobalState) => ({
  bpdPaymentMethodsActivation: bpdPaymentMethodActivationSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBpdOnNewPaymentMethodScreen);
