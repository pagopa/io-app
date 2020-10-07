import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../components/core/typography/Body";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
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

const NoPaymentMethodsAvailableScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, skip, addMethod, title, body } = loadLocales();
  return (
    <BaseScreenComponent goBack={false} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
          <View spacer={true} large={true} />
          <H1>{title}</H1>
          <View spacer={true} large={true} />
          <Body>{body}</Body>
        </View>
        <FooterTwoButtons
          onRight={props.skip}
          onCancel={props.skip}
          rightText={addMethod}
          leftText={skip}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => dispatch(navigateToWalletHome())
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NoPaymentMethodsAvailableScreen);
