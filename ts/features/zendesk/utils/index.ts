import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { isPanicModeActive } from "../../../utils/supportAssistance";
import { isReady } from "../../bonus/bpd/model/RemoteValue";
import ZENDESK_ROUTES from "../navigation/routes";
import { ZendeskConfig } from "../store/reducers";

export const handleContactSupport = (
  navigation: IOStackNavigationProp<AppParamsList>,
  assistanceForPayment: boolean,
  assistanceForCard: boolean,
  assistanceForFci: boolean,
  zendeskRemoteConfig: ZendeskConfig
) => {
  const canSkipCategoryChoice: boolean =
    !isReady(zendeskRemoteConfig) || assistanceForPayment;

  if (isPanicModeActive(zendeskRemoteConfig)) {
    // Go to panic mode screen
    navigation.navigate(ZENDESK_ROUTES.MAIN, {
      screen: ZENDESK_ROUTES.PANIC_MODE
    });
    return;
  }

  if (canSkipCategoryChoice) {
    navigation.navigate(ZENDESK_ROUTES.MAIN, {
      screen: ZENDESK_ROUTES.ASK_PERMISSIONS,
      params: { assistanceForPayment, assistanceForCard, assistanceForFci }
    });
  } else {
    navigation.navigate(ZENDESK_ROUTES.MAIN, {
      screen: ZENDESK_ROUTES.CHOOSE_CATEGORY,
      params: { assistanceForPayment, assistanceForCard, assistanceForFci }
    });
  }
};
