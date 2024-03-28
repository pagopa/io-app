import {
  Divider,
  HSpacer,
  Icon,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { FlatList, View } from "react-native";
import { navigateToAvailableBonusListScreen } from "../../features/bonus/common/navigation/actions";
import I18n from "../../i18n";
import NavigationService from "../../navigation/NavigationService";
import { navigateToWalletAddPaymentMethod } from "../../store/actions/navigation";
import {
  IOBottomSheetModal,
  useIOBottomSheetAutoresizableModal
} from "../../utils/hooks/bottomSheet";
import TouchableDefaultOpacity from "../TouchableDefaultOpacity";
import { H1 } from "../core/typography/H1";
import { H4 } from "../core/typography/H4";

type NavigationListItem = {
  title: string;
  subtitle: string;
  testId?: string;
  onPress: () => void;
};

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
    title: I18n.t("global.buttons.add"),
    component: (
      <FlatList
        data={navigationListItems}
        keyExtractor={item => item.title}
        renderItem={({ item }) => (
          <ListItemNav
            onPress={() => {
              dismiss();
              item.onPress();
            }}
            value={item.title}
            accessibilityLabel={item.title}
            description={item.subtitle}
            testID={item.testId}
          />
        )}
        ItemSeparatorComponent={() => <Divider />}
        ListFooterComponent={() => <VSpacer size={16} />}
      />
    )
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
