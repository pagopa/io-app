import { useFocusEffect } from "@react-navigation/native";
import I18n from "../../../../i18n";
import {
  itwLifecycleIdentityCheckCompleted,
  itwLifecycleWalletReset
} from "../store/actions";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { logoutRequest } from "../../../../store/actions/authentication";
import { useAvoidHardwareBackButton } from "../../../../utils/useAvoidHardwareBackButton";
import { useIODispatch, useIOStore } from "../../../../store/hooks";
import { trackItwIdNotMatch, trackWalletNewIdReset } from "../../analytics";

export const ItwIdentityNotMatchingScreen = () => {
  useAvoidHardwareBackButton();

  useFocusEffect(trackItwIdNotMatch);

  const dispatch = useIODispatch();
  const store = useIOStore();

  const resetWallet = () => {
    dispatch(itwLifecycleWalletReset());
    dispatch(itwLifecycleIdentityCheckCompleted());
    trackWalletNewIdReset(store.getState());
  };

  const handleCancel = () => {
    dispatch(logoutRequest({ withApiCall: true }));
  };

  return (
    <OperationResultScreenContent
      pictogram="attention"
      title={I18n.t(
        "features.itWallet.identification.notMatchingIdentityScreen.title"
      )}
      subtitle={I18n.t(
        "features.itWallet.identification.notMatchingIdentityScreen.subtitle"
      )}
      isHeaderVisible={false}
      action={{
        label: I18n.t(
          "features.itWallet.identification.notMatchingIdentityScreen.action"
        ),
        accessibilityLabel: I18n.t(
          "features.itWallet.identification.notMatchingIdentityScreen.action"
        ),
        onPress: resetWallet
      }}
      secondaryAction={{
        label: I18n.t("global.buttons.cancel"),
        accessibilityLabel: I18n.t("global.buttons.cancel"),
        onPress: handleCancel
      }}
    />
  );
};
