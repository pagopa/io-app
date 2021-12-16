import { NavigationActions } from "react-navigation";
import ZENDESK_ROUTES from "../../navigation/routes";

export type navigateToZendeskAskPermissionsPayload = {
  assistanceForPayment: boolean;
};

export const navigateToZendeskAskPermissions = (
  params: navigateToZendeskAskPermissionsPayload
) =>
  NavigationActions.navigate({
    routeName: ZENDESK_ROUTES.ASK_PERMISSIONS,
    params
  });
export const navigateToZendeskPanicMode = () =>
  NavigationActions.navigate({
    routeName: ZENDESK_ROUTES.PANIC_MODE
  });
export const navigateToZendeskChooseCategory = () =>
  NavigationActions.navigate({
    routeName: ZENDESK_ROUTES.CHOOSE_CATEGORY
  });
export const navigateToZendeskChooseSubCategory = () =>
  NavigationActions.navigate({
    routeName: ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY
  });
