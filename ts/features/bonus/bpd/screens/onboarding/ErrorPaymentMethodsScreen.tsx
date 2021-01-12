import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Body } from "../../../../../components/core/typography/Body";
import { H2 } from "../../../../../components/core/typography/H2";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../../components/ui/IconFont";
import I18n from "../../../../../i18n";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../store/actions/navigationHistory";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  center: { textAlign: "center" }
});

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.title"),
  title: I18n.t("bonus.bpd.onboarding.errorPaymentMethod.title"),
  body: I18n.t("bonus.bpd.onboarding.errorPaymentMethod.body"),
  cta: I18n.t("bonus.bpd.onboarding.errorPaymentMethod.cta")
});

const ErrorPaymentMethodsScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body, cta } = loadLocales();
  return (
    <BaseScreenComponent
      goBack={false}
      headerTitle={headerTitle}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <View spacer={true} extralarge={true} />
            <View spacer={true} extralarge={true} />
            <IconFont
              name={"io-complete"}
              size={120}
              color={IOColors.aqua as string}
              style={styles.center}
            />
            <View spacer={true} large={true} />
            <View spacer={true} large={true} />
            <H2 style={styles.center}>{title}</H2>
            <View spacer={true} extralarge={true} />
            <Body style={styles.center}>{body}</Body>
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={confirmButtonProps(props.skip, cta)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  skip: () => {
    dispatch(navigationHistoryPop(1));
    dispatch(navigateToWalletHome());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorPaymentMethodsScreen);
