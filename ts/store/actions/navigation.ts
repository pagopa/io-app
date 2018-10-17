import {
  NavigationAction,
  NavigationActions,
  NavigationResetAction,
  NavigationState,
  StackActions
} from "react-navigation";
import { ActionType, createStandardAction } from "typesafe-actions";

import { InferNavigationParams } from "../../types/react";

import ROUTES from "../../navigation/routes";

import { MessageDetailScreen } from "../../screens/messages/MessageDetailScreen";
import Checkout3DsScreen from "../../screens/wallet/Checkout3DsScreen";
import TransactionSummaryScreen from "../../screens/wallet/payment/TransactionSummaryScreen";
import TransactionDetailsScreen from "../../screens/wallet/TransactionDetailsScreen";
import TransactionsScreen from "../../screens/wallet/TransactionsScreen";

export const navigationRestore = createStandardAction("NAVIGATION_RESTORE")<
  NavigationState
>();

export type NavigationActions =
  | NavigationAction
  | ActionType<typeof navigationRestore>;

export const resetToAuthenticationRoute: NavigationResetAction = StackActions.reset(
  {
    index: 0,
    key: null,
    actions: [
      NavigationActions.navigate({
        routeName: ROUTES.AUTHENTICATION
      })
    ]
  }
);

export const navigateToMainNavigatorAction = StackActions.reset({
  key: "StackRouterRoot",
  index: 0,
  actions: [
    NavigationActions.navigate({
      routeName: ROUTES.MAIN
    })
  ]
});

export const navigateToOnboardingPinScreenAction = NavigationActions.navigate({
  routeName: ROUTES.ONBOARDING,
  action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_PIN })
});

export const navigateToTosScreen = NavigationActions.navigate({
  routeName: ROUTES.ONBOARDING,
  action: NavigationActions.navigate({ routeName: ROUTES.ONBOARDING_TOS })
});

export const navigateToPinLogin = NavigationActions.navigate({
  routeName: ROUTES.PIN_LOGIN,
  key: undefined
});

export const navigateToBackgroundScreen = NavigationActions.navigate({
  routeName: ROUTES.BACKGROUND
});

export const navigateBack = NavigationActions.back;

export const navigateToMessageDetailScreenAction = (
  params: InferNavigationParams<typeof MessageDetailScreen>
) =>
  StackActions.reset({
    key: "StackRouterRoot",
    index: 0,
    actions: [
      NavigationActions.navigate({
        routeName: ROUTES.MAIN,
        action: NavigationActions.navigate({
          routeName: ROUTES.MESSAGES_NAVIGATOR,
          action: NavigationActions.navigate({
            routeName: ROUTES.MESSAGE_DETAIL,
            params
          })
        })
      })
    ]
  });

export const navigateToWalletTransactionSummaryScreen = (
  params: InferNavigationParams<typeof TransactionSummaryScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
    params
  });

// TODO: this should use StackActions.reset
// to reset the navigation. Right now, the
// "back" option is not allowed -- so the user cannot
// get back to previous screens, but the navigation
// stack should be cleaned right here
// @https://www.pivotaltracker.com/story/show/159300579
export const navigateToTransactionDetailsScreen = (
  params: InferNavigationParams<typeof TransactionDetailsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_TRANSACTION_DETAILS,
    params
  });

export const navigateToWalletCheckout3dsScreen = (
  params: InferNavigationParams<typeof Checkout3DsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_CHECKOUT_3DS_SCREEN,
    params
  });

export const navigateToWalletTransactionsScreen = (
  params: InferNavigationParams<typeof TransactionsScreen>
) =>
  NavigationActions.navigate({
    routeName: ROUTES.WALLET_CARD_TRANSACTIONS,
    params
  });
