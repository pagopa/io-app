import I18n from "i18next";
import { useCallback } from "react";

import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../../store/hooks";
import CGN_ROUTES from "../../navigation/routes";
import { cgnActivationCancel } from "../../store/actions/activation";

/**
 * Screen which is displayed when a user requested a CGN activation but it is
 * yet active
 */
const CgnAlreadyActiveScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const navigateToDetail = useCallback(() => {
    dispatch(cgnActivationCancel());
    navigation.navigate(CGN_ROUTES.DETAILS.MAIN, {
      screen: CGN_ROUTES.DETAILS.DETAILS
    });
  }, [dispatch, navigation]);

  return (
    <OperationResultScreenContent
      action={{
        label: I18n.t("bonus.cgn.cta.goToDetail"),
        accessibilityLabel: I18n.t("bonus.cgn.cta.goToDetail"),
        testID: "cgnConfirmButtonTestId",
        onPress: navigateToDetail
      }}
      pictogram="cardFavourite"
      subtitle={I18n.t("bonus.cgn.activation.alreadyActive.body")}
      title={I18n.t("bonus.cgn.activation.alreadyActive.title")}
    />
  );
};

export default CgnAlreadyActiveScreen;
