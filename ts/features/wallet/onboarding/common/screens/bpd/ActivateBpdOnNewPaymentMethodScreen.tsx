import * as React from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../store/reducers/types";
import { PaymentMethod } from "../../../../../../types/pagopa";
import { PaymentMethodRawList } from "../../../../../bonus/bpd/components/paymentMethodActivationToggle/list/PaymentMethodRawList";
import { areAnyPaymentMethodsActiveSelector } from "../../../../../bonus/bpd/store/reducers/details/paymentMethods";

type OwnProps = {
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

const ActivateBpdOnNewPaymentMethodScreen: React.FunctionComponent<Props> =
  props => {
    const { title, body1, body2 } = loadLocales();

    return (
      <BaseScreenComponent
        headerTitle={props.title}
        contextualHelp={props.contextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView>
            <View style={IOStyles.horizontalContentPadding}>
              <VSpacer size={24} />
              <H1>{title}</H1>
              <VSpacer size={24} />
              <Body>{body1}</Body>
              <VSpacer size={24} />
              <PaymentMethodRawList paymentList={props.paymentMethods} />
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
  skip: () => navigateBack()
});

const mapStateToProps = (state: GlobalState, props: OwnProps) => ({
  areAnyPaymentMethodsActive: areAnyPaymentMethodsActiveSelector(
    props.paymentMethods
  )(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivateBpdOnNewPaymentMethodScreen);
