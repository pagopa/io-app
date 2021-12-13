import { NavigationActions } from "react-navigation";
import ZENDESK_ROUTES from "../../navigation/routes";

export const navigateToZendeskAskPermissions = () =>
  NavigationActions.navigate({
    routeName: ZENDESK_ROUTES.ASK_PERMISSIONS
  });
export const navigateToZendeskChooseCategory = () =>
  NavigationActions.navigate({
    routeName: ZENDESK_ROUTES.CHOOSE_CATEGORY
  });
export const navigateToZendeskChooseSubCategory = () =>
  NavigationActions.navigate({
    routeName: ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY
  });
