import { HSpacer, IOColors, Icon, VSpacer } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { navigateToAvailableBonusListScreen } from "../../features/bonus/common/navigation/actions";
import I18n from "../../i18n";
import NavigationService from "../../navigation/NavigationService";
import { navigateToWalletAddPaymentMethod } from "../../store/actions/navigation";
import {
  IOBottomSheetModal,
  useIOBottomSheetAutoresizableModal
} from "../../utils/hooks/bottomSheet";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import ItemSeparatorComponent from "../ItemSeparatorComponent";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { H1 } from "../core/typography/H1";
import { H3 } from "../core/typography/H3";
import { H4 } from "../core/typography/H4";
import { H5 } from "../core/typography/H5";
import { IOStyles } from "../core/variables/IOStyles";

type NavigationListItem = {
  title: string;
  subtitle: string;
  testId?: string;
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
export const useWalletHomeHeaderBottomSheet = (): IOBottomSheetModal => {
  const navigationListItems: ReadonlyArray<NavigationListItem> = [
    {
      title: I18n.t("wallet.paymentMethod"),
      testId: "wallet.paymentMethod",
      subtitle: I18n.t("wallet.paymentMethodDesc"),
      onPress: () =>
        navigateToWalletAddPaymentMethod({
          inPayment: O.none,
          keyFrom: NavigationService.getCurrentRouteKey()
        })
    },
    {
      title: I18n.t("wallet.methods.bonus.name"),
      subtitle: I18n.t("wallet.methods.bonus.description"),
      testId: "bonusNameTestId",
      onPress: navigateToAvailableBonusListScreen
    }
  ];

  const { present, bottomSheet, dismiss } = useIOBottomSheetAutoresizableModal({
    component: (
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
              testID={item.testId}
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
        ListFooterComponent={() => <VSpacer size={16} />}
      />
    ),
    title: I18n.t("global.buttons.add")
  });
  return { present, bottomSheet, dismiss };
};

const WalletHomeHeader = () => {
  const { present, bottomSheet } = useWalletHomeHeaderBottomSheet();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 8
      }}
    >
      <H1
        color={"white"}
        accessible={true}
        accessibilityRole="header"
        testID="wallet-home-header-title"
      >
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
        <H4 color={"white"} testID="walletAddNewPaymentMethodTestId">
          {I18n.t("wallet.newPaymentMethod.add").toUpperCase()}
        </H4>
      </TouchableDefaultOpacity>
      {bottomSheet}
    </View>
  );
};

export default WalletHomeHeader;
