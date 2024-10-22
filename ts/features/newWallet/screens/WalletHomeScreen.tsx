import { IOStyles, IOToast } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { ScrollView } from "react-native";
import { IOScrollView } from "../../../components/ui/IOScrollView";
import I18n from "../../../i18n";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { MainTabParamsList } from "../../../navigation/params/MainTabParamsList";
import { useIODispatch, useIOSelector, useIOStore } from "../../../store/hooks";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import { cgnDetails } from "../../bonus/cgn/store/actions/details";
import { idPayWalletGet } from "../../idpay/wallet/store/actions";
import {
  trackAllCredentialProfileAndSuperProperties,
  trackOpenWalletScreen,
  trackWalletAdd
} from "../../itwallet/analytics";
import { ITW_ROUTES } from "../../itwallet/navigation/routes";
import { getPaymentsWalletUserMethods } from "../../payments/wallet/store/actions";
import { WalletCardsContainer } from "../components/WalletCardsContainer";
import { WalletCategoryFilterTabs } from "../components/WalletCategoryFilterTabs";
import { walletToggleLoadingState } from "../store/actions/placeholders";
import { selectWalletCards } from "../store/selectors";

type Props = IOStackNavigationRouteProps<MainTabParamsList, "WALLET_HOME">;

const WalletHomeScreen = ({ route }: Props) => {
  const store = useIOStore();
  useFocusEffect(() => {
    trackOpenWalletScreen();
    void trackAllCredentialProfileAndSuperProperties(store.getState());
  });

  const dispatch = useIODispatch();
  const isNewElementAdded = React.useRef(route.params?.newMethodAdded || false);

  useOnFirstRender(() => {
    fetchWalletSectionData();
  });

  const fetchWalletSectionData = () => {
    dispatch(walletToggleLoadingState(true));
    dispatch(getPaymentsWalletUserMethods.request());
    dispatch(idPayWalletGet.request());
    dispatch(cgnDetails.request());
  };

  // Handles the "New element added" toast display once the user returns to this screen
  useFocusEffect(
    React.useCallback(() => {
      if (isNewElementAdded.current) {
        IOToast.success(I18n.t("features.wallet.home.toast.newMethod"));
        // eslint-disable-next-line functional/immutable-data
        isNewElementAdded.current = false;
      }
    }, [isNewElementAdded])
  );

  return (
    <WalletScrollView>
      <WalletCategoryFilterTabs />
      <WalletCardsContainer />
    </WalletScrollView>
  );
};

const WalletScrollView = ({ children }: React.PropsWithChildren<any>) => {
  const navigation = useIONavigation();
  const cards = useIOSelector(selectWalletCards);

  const handleAddToWalletButtonPress = () => {
    trackWalletAdd();
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.ONBOARDING
    });
  };

  if (cards.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={[
          IOStyles.flex,
          IOStyles.horizontalContentPadding
        ]}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <IOScrollView
      actions={{
        type: "SingleButton",
        primary: {
          testID: "walletAddCardButtonTestID",
          label: I18n.t("features.wallet.home.cta"),
          icon: "addSmall",
          iconPosition: "end",
          onPress: handleAddToWalletButtonPress
        }
      }}
      excludeSafeAreaMargins={true}
    >
      {children}
    </IOScrollView>
  );
};

export { WalletHomeScreen };
