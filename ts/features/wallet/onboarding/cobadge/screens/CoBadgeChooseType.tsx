import { none } from "fp-ts/lib/Option";
import { Content, ListItem, View } from "native-base";
import * as React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import IconFont from "../../../../../components/ui/IconFont";
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

const styles = StyleSheet.create({
  flexColumn: {
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  descriptionPadding: { paddingRight: 24 }
});
type CardOnlinePurchase = "enabled" | "disabled" | "unknown";

type IAddCardPath = Readonly<{
  path: CardOnlinePurchase;
  title: string;
  description: string;
  onPress: () => void;
}>;

const renderListItem = (cardPathItem: ListRenderItemInfo<IAddCardPath>) => (
  <ListItem
    onPress={cardPathItem.item.onPress}
    first={cardPathItem.index === 0}
  >
    <View style={styles.flexColumn}>
      <View style={styles.row}>
        <View>
          <H3 color={"bluegreyDark"} weight={"SemiBold"}>
            {cardPathItem.item.title}
          </H3>
        </View>
        <IconFont name={"io-right"} color={IOColors.blue} size={24} />
      </View>
      <H5
        color={"bluegrey"}
        weight={"Regular"}
        style={styles.descriptionPadding}
      >
        {cardPathItem.item.description}
      </H5>
    </View>
  </ListItem>
);
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
  const addCardPath: ReadonlyArray<IAddCardPath> = [
    {
      path: "enabled",
      title: I18n.t("wallet.onboarding.coBadge.chooseType.path.enabled.title"),
      description: I18n.t(
        "wallet.onboarding.coBadge.chooseType.path.enabled.description"
      ),
      onPress: () => props.addCreditCard(legacyAddCreditCardBack)
    },
    {
      path: "disabled",
      title: I18n.t("wallet.onboarding.coBadge.chooseType.path.disabled.title"),
      description: I18n.t(
        "wallet.onboarding.coBadge.chooseType.path.disabled.description"
      ),
      onPress: () => props.addCoBadge(abi)
    },
    {
      path: "unknown",
      title: I18n.t("wallet.onboarding.coBadge.chooseType.path.unknown.title"),
      description: I18n.t(
        "wallet.onboarding.coBadge.chooseType.path.unknown.description"
      ),
      onPress: () => props.addCoBadge(abi)
    }
  ];
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.onboarding.coBadge.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          <H1>{I18n.t("wallet.onboarding.coBadge.chooseType.title")}</H1>
          <View spacer={true} />
          <H4 weight={"Regular"} color={"bluegreyDark"}>
            {I18n.t("wallet.onboarding.coBadge.chooseType.description")}
          </H4>
          <View spacer={true} />
          <FlatList
            removeClippedSubviews={false}
            data={addCardPath}
            keyExtractor={item => item.path}
            ListFooterComponent={<View spacer />}
            renderItem={i => renderListItem(i)}
          />
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
