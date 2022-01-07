import { NavigationActions } from "react-navigation";
import ZENDESK_ROUTES from "../../navigation/routes";
import { InferNavigationParams } from "../../../../types/react";
import ZendeskAskPermissions from "../../screens/ZendeskAskPermissions";

export const navigateToZendeskAskPermissions = (
  params: InferNavigationParams<typeof ZendeskAskPermissions>
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
