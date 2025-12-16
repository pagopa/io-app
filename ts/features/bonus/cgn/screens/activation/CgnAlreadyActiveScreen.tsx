import { useCallback } from "react";
import I18n from "i18next";
import { cgnActivationCancel } from "../../store/actions/activation";
import { useIODispatch } from "../../../../../store/hooks";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import CGN_ROUTES from "../../navigation/routes";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";

/**
 * Screen which is displayed when a user requested a CGN activation
 * but it is yet active
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
      pictogram="cardFavourite"
      title={I18n.t("bonus.cgn.activation.alreadyActive.title")}
      subtitle={I18n.t("bonus.cgn.activation.alreadyActive.body")}
      action={{
        label: I18n.t("bonus.cgn.cta.goToDetail"),
        accessibilityLabel: I18n.t("bonus.cgn.cta.goToDetail"),
        testID: "cgnConfirmButtonTestId",
        onPress: navigateToDetail
      }}
    />
  );
};

export default CgnAlreadyActiveScreen;
