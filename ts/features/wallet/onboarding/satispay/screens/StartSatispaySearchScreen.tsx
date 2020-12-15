import { View } from "native-base";
import * as React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { navigateToOnboardingSatispaySearchAvailableUserAccount } from "../navigation/action";
import {
  searchUserSatispay,
  walletAddSatispayBack,
  walletAddSatispayCancel
} from "../store/actions";
import { H1 } from "../../../../../components/core/typography/H1";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("wallet.onboarding.satispay.headerTitle"),
  title: I18n.t("wallet.onboarding.satispay.add.title")
});

/**
 * Entrypoint for the satispay onboarding. The user can choose to start the search or
 * cancel and return back.
 * @constructor
 */
const StartSatispaySearchScreen: React.FunctionComponent<Props> = props => {
  const { headerTitle, title } = loadLocales();
  return (
    <BaseScreenComponent goBack={props.goBack} headerTitle={headerTitle}>
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView>
          <H1>{title}</H1>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineThird"}
          leftButton={cancelButtonProps(
            props.cancel,
            I18n.t("global.buttons.cancel")
          )}
          rightButton={confirmButtonProps(
            props.search,
            I18n.t("global.buttons.continue")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(walletAddSatispayBack()),
  cancel: () => dispatch(walletAddSatispayCancel()),
  search: () => {
    dispatch(searchUserSatispay.request());
    dispatch(navigateToOnboardingSatispaySearchAvailableUserAccount());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StartSatispaySearchScreen);
