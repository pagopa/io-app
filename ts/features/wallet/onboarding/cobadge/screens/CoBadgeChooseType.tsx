import * as O from "fp-ts/lib/Option";
import * as React from "react";
import {
  View,
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  Icon,
  PressableListItemBase,
  VSpacer
} from "@pagopa/io-app-design-system";
import { Route, useRoute } from "@react-navigation/native";
import { H1 } from "../../../../../components/core/typography/H1";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import {
  navigateBack as legacyNavigateBack,
  navigateToWalletAddCreditCard
} from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { cancelButtonProps } from "../../../../../components/buttons/ButtonConfigurations";
import { walletAddCoBadgeStart } from "../store/actions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

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
  <PressableListItemBase
    onPress={cardPathItem.item.onPress}
    first={cardPathItem.index === 0}
    testID={`${cardPathItem.item.path}Item`}
  >
    <View style={styles.flexColumn}>
      <View style={styles.row}>
        <View>
          <H3 color={"bluegreyDark"} weight={"SemiBold"}>
            {cardPathItem.item.title}
          </H3>
        </View>
        <Icon name="chevronRightListItem" color="blue" size={24} />
      </View>
      <H5
        color={"bluegrey"}
        weight={"Regular"}
        style={styles.descriptionPadding}
      >
        {cardPathItem.item.description}
      </H5>
    </View>
  </PressableListItemBase>
);
/**
 * This screen allows the user to choose the exact type of card he intends to add
 * @param props
 * @constructor
 */
const CoBadgeChooseType = (props: Props): React.ReactElement => {
  const route =
    useRoute<
      Route<
        "WALLET_ONBOARDING_COBADGE_CHOOSE_TYPE",
        CoBadgeChooseTypeNavigationProps
      >
    >();
  const abi = route.params.abi;
  const legacyAddCreditCardBack = route.params.legacyAddCreditCardBack;
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
      <SafeAreaView style={IOStyles.flex} testID="coBadgeChooseType">
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("wallet.onboarding.coBadge.chooseType.title")}</H1>
          <VSpacer size={16} />
          <H4 weight={"Regular"} color={"bluegreyDark"}>
            {I18n.t("wallet.onboarding.coBadge.chooseType.description")}
          </H4>
          <VSpacer size={16} />
          <FlatList
            removeClippedSubviews={false}
            data={addCardPath}
            keyExtractor={item => item.path}
            ListFooterComponent={<VSpacer size={16} />}
            renderItem={i => renderListItem(i)}
          />
        </View>
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
  legacyNavigateBack();
  navigateBack(n - 1, dispatch);
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => legacyNavigateBack(),
  addCoBadge: (abi: string | undefined) => dispatch(walletAddCoBadgeStart(abi)),
  addCreditCard: (popScreenNumber: number = 0) => {
    navigateBack(popScreenNumber, dispatch);
    navigateToWalletAddCreditCard({
      inPayment: O.none
    });
  }
});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CoBadgeChooseType);
