import { useMemo } from "react";
import I18n from "i18next";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { logoutRequest } from "../../../authentication/common/store/actions";
import { useIODispatch } from "../../../../store/hooks";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";

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
      pictogram="ended"
      title={I18n.t("profile.main.privacy.removeAccount.success.title")}
      subtitle={I18n.t("profile.main.privacy.removeAccount.success.body")}
      action={actions}
    />
  );
};

export default RemoveAccountSuccess;
