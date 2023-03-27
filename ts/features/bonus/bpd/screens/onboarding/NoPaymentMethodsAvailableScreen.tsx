import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import {
  navigateToWalletAddPaymentMethod,
  navigateToWalletHome
} from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { FooterTwoButtons } from "../../../bonusVacanze/components/markdown/FooterTwoButtons";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  skip: I18n.t("global.buttons.skip"),
  addMethod: I18n.t("wallet.newPaymentMethod.addButton"),
  title: I18n.t("bonus.bpd.onboarding.noPaymentMethod.title"),
  body: I18n.t("bonus.bpd.onboarding.noPaymentMethod.body")
});

const NoPaymentMethodsAvailableScreen: React.FunctionComponent<Props> =
  props => {
    const { headerTitle, skip, addMethod, title, body } = loadLocales();
    return (
      <BaseScreenComponent
        goBack={false}
        headerTitle={headerTitle}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <VSpacer size={24} />
            <H1>{title}</H1>
            <VSpacer size={24} />
            <Body>{body}</Body>
          </View>
          <FooterTwoButtons
            onRight={props.addPaymentMethod}
            onCancel={props.skip}
            rightText={addMethod}
            leftText={skip}
          />
        </SafeAreaView>
      </BaseScreenComponent>
    );
  };

const mapDispatchToProps = (_: Dispatch) => ({
  skip: () => {
    navigateToWalletHome();
  },
  addPaymentMethod: () => {
    navigateToWalletHome();
    navigateToWalletAddPaymentMethod({ inPayment: O.none });
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoPaymentMethodsAvailableScreen);
