import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { isPanicModeActive } from "../../../utils/supportAssistance";
import { isReady } from "../../../common/model/RemoteValue";
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

type TokenType =
  | "spidLevel"
  | "walletToken"
  | "myPortalToken"
  | "bpdToken"
  | "zendeskToken"
  | "fimsToken"
  | "lollipopAssertionRef";

type DefaultTokenType = Exclude<TokenType, "zendeskToken">;

// Define a function that takes an optional array of TokenType
export function formatRequestedTokenString(
  refreshZendeskTokenSel: boolean,
  tokenType?: Array<TokenType>
): string {
  // If tokenType is provided and contains values, return the joined tokens
  // eslint-disable-next-line functional/no-let
  let tokensArray;
  if (tokenType && tokenType.length > 0) {
    tokensArray = tokenType;
  } else {
    // If tokenType is not provided, return the default list excluding "zendeskToken"
    const defaultTokens: Array<DefaultTokenType> = [
      "spidLevel",
      "walletToken",
      "myPortalToken",
      "bpdToken",
      "fimsToken",
      "lollipopAssertionRef"
    ];
    tokensArray = defaultTokens;
  }

  if (refreshZendeskTokenSel && !tokensArray.includes("zendeskToken", 0)) {
    return `(${[...tokensArray, "zendeskToken"].join(",")})`;
  } else {
    return `(${tokensArray.join(",")})`;
  }
}
