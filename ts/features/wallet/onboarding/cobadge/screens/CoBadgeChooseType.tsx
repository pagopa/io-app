import { none } from "fp-ts/lib/Option";
import { Button, Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { navigateToWalletAddCreditCard } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import {
  walletAddCoBadgeFromBancomatStart,
  walletAddCoBadgeStart
} from "../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen allows the user to choose the exact type of card he intends to add
 * @param props
 * @constructor
 */
const CoBadgeChooseType = (props: Props): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("wallet.onboarding.coBadge.headerTitle")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView style={IOStyles.flex}>
      <Content style={IOStyles.flex}>
        <H1>CoBadgeChooseType</H1>
        <Button onPress={props.addCreditCard}>
          <H1>Add Credit Card</H1>
        </Button>
        <View spacer={true} />
        <Button onPress={props.addCoBadge}>
          <H1>Add Co-Badge</H1>
        </Button>
      </Content>
      <FooterWithButtons
        type={"SingleButton"}
        leftButton={cancelButtonProps(props.back)}
      />
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(NavigationActions.back()),
  addCoBadge: () => dispatch(walletAddCoBadgeFromBancomatStart()),
  addCreditCard: () =>
    dispatch(
      navigateToWalletAddCreditCard({
        inPayment: none,
        keyFrom: "WALLET_HOME_SCREEN"
      })
    )
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeChooseType);
