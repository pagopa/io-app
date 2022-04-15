import { ZendeskAskPermissionsNavigationParams } from "../screens/ZendeskAskPermissions";
import { ZendeskChooseCategoryNavigationParams } from "../screens/ZendeskChooseCategory";
import { ZendeskChooseSubCategoryNavigationParams } from "../screens/ZendeskChooseSubCategory";
import ZENDESK_ROUTES from "./routes";

export type ZendeskParamsList = {
  [ZENDESK_ROUTES.HELP_CENTER]: undefined;
  [ZENDESK_ROUTES.PANIC_MODE]: undefined;
  [ZENDESK_ROUTES.ASK_PERMISSIONS]: ZendeskAskPermissionsNavigationParams;
  [ZENDESK_ROUTES.CHOOSE_CATEGORY]: ZendeskChooseCategoryNavigationParams;
  [ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY]: ZendeskChooseSubCategoryNavigationParams;
};
