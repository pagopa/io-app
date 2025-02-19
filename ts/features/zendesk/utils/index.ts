import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../navigation/params/AppParamsList";
import { isPanicModeActive } from "../../../utils/supportAssistance";
import { isReady } from "../../../common/model/RemoteValue";
import ZENDESK_ROUTES from "../navigation/routes";
import { ZendeskConfig } from "../store/reducers";
import { PublicSession } from "../../../../definitions/session_manager/PublicSession";
import { type ZendeskAssistanceType } from "../store/actions";

export const handleContactSupport = (
  navigation: IOStackNavigationProp<AppParamsList>,
  assistanceType: ZendeskAssistanceType,
  zendeskRemoteConfig: ZendeskConfig
) => {
  const canSkipCategoryChoice: boolean =
    !isReady(zendeskRemoteConfig) ||
    !!assistanceType.payment ||
    !!assistanceType.idPay;

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
      params: { assistanceType }
    });
  } else {
    navigation.navigate(ZENDESK_ROUTES.MAIN, {
      screen: ZENDESK_ROUTES.CHOOSE_CATEGORY,
      params: { assistanceType }
    });
  }
};

type TokenType = keyof PublicSession;

type DefaultTokenType = Exclude<TokenType, "zendeskToken">;

/**
 *
 * @param needToRefreshZendeskToken a boolean value defining if it is necessary
 * to add the zendesk token or not (in case it is not contained in tokenType array)
 * @param tokenType an array containing the tokens that must be transformed into
 * a string to be passed as a parameter to the getSession(). The tokenType isn't mandatory
 * @returns a string. In the case where tokenType is passed, then the function returns
 * a string that contains the elements included in the tokenType array, in the case where
 * tokenType is not passed it returns a default string. In addition, if the prop
 * needToRefreshZendeskToken is true and the value ‘zendeskToken’ is not present in the
 * object, then it will be inserted.
 */
export const formatRequestedTokenString = (
  needToRefreshZendeskToken: boolean = false,
  tokenType?: Array<TokenType>
): string => {
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
      "bpdToken",
      "fimsToken",
      "lollipopAssertionRef",
      // TODO: Evaluate whether it makes sense to keep this value among the default tokens or not.
      // Depends on https://pagopa.atlassian.net/browse/IOPID-2750
      "expirationDate"
    ];
    tokensArray = defaultTokens;
  }

  if (needToRefreshZendeskToken && !tokensArray.includes("zendeskToken", 0)) {
    return `(${tokensArray.join(",")},zendeskToken)`;
  } else {
    return `(${tokensArray.join(",")})`;
  }
};

/**
 *
 * @param newValues are the new values that need to be merged with the existing ones
 * @param currentValues are the existing values
 * @returns  an object containing the merge between existing and new values.
 * If the value already exists, it is replaced with the new value.
 * If the value is not defined, a new key is added.
 */
export const getOnlyNotAlreadyExistentValues = (
  newValues: PublicSession,
  currentValues?: PublicSession
): PublicSession => ({ ...currentValues, ...newValues });
