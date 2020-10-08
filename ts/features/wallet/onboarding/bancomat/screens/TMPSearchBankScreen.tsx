import { View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { FooterTwoButtons } from "../../../../bonus/bonusVacanze/components/markdown/FooterTwoButtons";
import { navigateToOnboardingBancomatSearchAvailableUserBancomat } from "../navigation/action";
import {
  searchUserPans,
  walletAddBancomatBack,
  walletAddBancomatCancel
} from "../store/actions";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * TODO: TEMP Component only for proof of concept and avoid conflicts, will be removed in the next iteration
 * @constructor
 */
const TMPSearchBankScreen: React.FunctionComponent<Props> = props => (
  <BaseScreenComponent goBack={props.back} headerTitle={"Search a bank"}>
    <SafeAreaView style={IOStyles.flex}>
      <View style={IOStyles.flex}>
        <H1>Search a bank, Or maybe not!</H1>
      </View>
      <FooterTwoButtons
        onRight={props.searchBancomat}
        onCancel={props.cancel}
        rightText={I18n.t("global.buttons.continue")}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(walletAddBancomatBack()),
  cancel: () => dispatch(walletAddBancomatCancel()),
  searchBancomat: () => {
    dispatch(searchUserPans.request(undefined));
    dispatch(navigateToOnboardingBancomatSearchAvailableUserBancomat());
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TMPSearchBankScreen);
