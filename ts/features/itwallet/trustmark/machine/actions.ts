import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { checkCurrentSession } from "../../../../store/actions/authentication";
import { useIOStore } from "../../../../store/hooks";

export const createItwTrustmarkActionsImplementation = (
  store: ReturnType<typeof useIOStore>,
  navigation: ReturnType<typeof useIONavigation>
) => {
  /**
   * Handles the session expired event by dispatching the session expired action and navigating back to the credential details screen
   */
  const handleSessionExpired = () => {
    store.dispatch(checkCurrentSession.success({ isSessionValid: false }));
    navigation.pop();
  };

  return { handleSessionExpired };
};
