import * as React from "react";
import { View, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H2 } from "../../../../../components/core/typography/H2";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { navigateToWalletHome } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { Icon } from "../../../../../components/core/icons/Icon";

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
          {/* TODO: Refactor the following screen because you can't
          use huge spacers to center the screen content.
          You have to think about position logic. */}
          <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
            <VSpacer size={40} />
            <VSpacer size={40} />
            <Icon name="ok" size={96} color="aqua" />
            <VSpacer size={48} />
            <H2 style={styles.center}>{title}</H2>
            <VSpacer size={40} />
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

const mapDispatchToProps = (_: Dispatch) => ({
  skip: () => {
    navigateToWalletHome();
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorPaymentMethodsScreen);
