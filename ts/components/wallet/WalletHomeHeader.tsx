import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { navigateToAvailableBonusScreen } from "../../features/bonus/bonusVacanze/navigation/action";
import I18n from "../../i18n";
import NavigationService from "../../navigation/NavigationService";
import { navigateToWalletAddPaymentMethod } from "../../store/actions/navigation";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";
import { useIOBottomSheetModal } from "../../utils/hooks/bottomSheet";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import { HSpacer } from "../core/spacer/Spacer";
import { H1 } from "../core/typography/H1";
import { H3 } from "../core/typography/H3";
import { H4 } from "../core/typography/H4";
import { H5 } from "../core/typography/H5";
import { IOColors } from "../core/variables/IOColors";
import { IOStyles } from "../core/variables/IOStyles";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { Icon } from "../core/icons";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type NavigationListItem = {
  title: string;
  subtitle: string;
  onPress: () => void;
};

const styles = StyleSheet.create({
  container: {
    paddingRight: 0,
    paddingLeft: 0,
    marginVertical: 20,
    height: 60,
    backgroundColor: IOColors.white
  },
  flexColumn: {
    flexDirection: "column",
    flex: 1
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  }
});

const WalletHomeHeader = (props: Props) => {
  const navigationListItems: ReadonlyArray<NavigationListItem> = [
    {
      title: I18n.t("wallet.paymentMethod"),
      subtitle: I18n.t("wallet.paymentMethodDesc"),
      onPress: () =>
        props.navigateToWalletAddPaymentMethod(
          NavigationService.getCurrentRouteKey()
        )
    },
    {
      title: I18n.t("wallet.methods.bonus.name"),
      subtitle: I18n.t("wallet.methods.bonus.description"),
      onPress: props.navigateToBonusList
    }
  ];

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal(
    <FlatList
      data={navigationListItems}
      keyExtractor={item => item.title}
      renderItem={({ item, index }) => (
        <>
          <ButtonDefaultOpacity
            onPress={() => {
              dismiss();
              item.onPress();
            }}
            style={styles.container}
            onPressWithGestureHandler={true}
          >
            <View style={styles.flexColumn}>
              <View style={styles.row}>
                <View style={IOStyles.flex}>
                  <H3 color={"bluegreyDark"} weight={"SemiBold"}>
                    {item.title}
                  </H3>
                  <H5 color={"bluegrey"} weight={"Regular"}>
                    {item.subtitle}
                  </H5>
                </View>
                <Icon name="chevronRightListItem" color="blue" size={24} />
              </View>
            </View>
          </ButtonDefaultOpacity>

          {index !== navigationListItems.length - 1 && (
            <ItemSeparatorComponent noPadded />
          )}
        </>
      )}
    />,
    I18n.t("global.buttons.add"),
    315
  );

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8
      }}
    >
      <H1 color={"white"} accessible={true} accessibilityRole="header">
        {I18n.t("wallet.wallet")}
      </H1>
      <TouchableDefaultOpacity
        style={{
          flexDirection: "row",
          alignItems: "center"
        }}
        onPress={present}
        accessible={true}
        accessibilityLabel={I18n.t("wallet.accessibility.addElement")}
        accessibilityRole="button"
      >
        <Icon name="add" color="white" size={20} />
        <HSpacer size={8} />
        <H4 color={"white"}>
          {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
        </H4>
      </TouchableDefaultOpacity>
      {bottomSheet}
    </View>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({
  navigateToWalletAddPaymentMethod: (keyFrom?: string) =>
    navigateToWalletAddPaymentMethod({ inPayment: O.none, keyFrom }),
  navigateToBonusList: () => navigateToAvailableBonusScreen()
});

export default connect(mapStateToProps, mapDispatchToProps)(WalletHomeHeader);
