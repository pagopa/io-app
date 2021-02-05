import { none } from "fp-ts/lib/Option";
import { Button, Content, View } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
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
import { cancelButtonProps } from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { walletAddCoBadgeStart } from "../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  NavigationInjectedProps<CoBadgeChooseTypeNavigationProps>;

export type CoBadgeChooseTypeNavigationProps = {
  abi?: string;
  // Added for backward compatibility, in order to return back after add credit card workflow.
  // Number of screens that need to be removed from the stack
  legacyAddCreditCardBack?: number;
};

/**
 * This screen allows the user to choose the exact type of card he intends to add
 * @param props
 * @constructor
 */
const CoBadgeChooseType = (props: Props): React.ReactElement => {
  const abi = props.navigation.getParam("abi");
  const legacyAddCreditCardBack = props.navigation.getParam(
    "legacyAddCreditCardBack"
  );
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.onboarding.coBadge.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          <H1>TMP CoBadgeChooseType</H1>
          <Button onPress={() => props.addCreditCard(legacyAddCreditCardBack)}>
            <H1>TMP Add Credit Card</H1>
          </Button>
          <View spacer={true} />
          <Button onPress={() => props.addCoBadge(abi)}>
            <H1>TMP Add Co-Badge</H1>
          </Button>
        </Content>
        <FooterWithButtons
          type={"SingleButton"}
          leftButton={cancelButtonProps(props.back)}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const navigateBack = (n: number, dispatch: Dispatch) => {
  if (n <= 0) {
    return;
  }
  dispatch(NavigationActions.back());
  navigateBack(n - 1, dispatch);
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(NavigationActions.back()),
  addCoBadge: (abi: string | undefined) => dispatch(walletAddCoBadgeStart(abi)),
  addCreditCard: (popScreenNumber: number = 0) => {
    navigateBack(popScreenNumber, dispatch);

    dispatch(
      navigateToWalletAddCreditCard({
        inPayment: none
      })
    );
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeChooseType);
