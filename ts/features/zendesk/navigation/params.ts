import { ZendeskAskPermissionsNavigationParams } from "../screens/ZendeskAskPermissions";
import { ZendeskSupportHelpCenterNavigationParams } from "../screens/ZendeskSupportHelpCenter";
import ZENDESK_ROUTES from "./routes";

export type ZendeskParamsList = {
  [ZENDESK_ROUTES.HELP_CENTER]: ZendeskSupportHelpCenterNavigationParams;
  [ZENDESK_ROUTES.PANIC_MODE]: undefined;
  [ZENDESK_ROUTES.ASK_PERMISSIONS]: ZendeskAskPermissionsNavigationParams;
  [ZENDESK_ROUTES.CHOOSE_CATEGORY]: undefined;
  [ZENDESK_ROUTES.CHOOSE_SUB_CATEGORY]: undefined;
};
