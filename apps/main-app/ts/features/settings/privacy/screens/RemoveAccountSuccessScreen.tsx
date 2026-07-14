import I18n from "i18next";
import { useMemo } from "react";

import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { useIODispatch } from "../../../../store/hooks";
import { logoutRequest } from "../../../authentication/common/store/actions";

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountSuccess = () => {
  const dispatch = useIODispatch();
  // do nothing
  useHardwareBackButton(() => true);

  const actions = useMemo(
    () => ({
      label: I18n.t("profile.main.privacy.removeAccount.success.cta"),
      accessibilityLabel: I18n.t(
        "profile.main.privacy.removeAccount.success.cta"
      ),
      onPress: () => {
        dispatch(logoutRequest({ withApiCall: true }));
      }
    }),
    [dispatch]
  );

  return (
    <OperationResultScreenContent
      action={actions}
      pictogram="ended"
      subtitle={I18n.t("profile.main.privacy.removeAccount.success.body")}
      title={I18n.t("profile.main.privacy.removeAccount.success.title")}
    />
  );
};

export default RemoveAccountSuccess;
