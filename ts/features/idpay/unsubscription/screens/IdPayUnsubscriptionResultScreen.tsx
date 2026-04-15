import { IOPictograms } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idPayUnsubscribeAction } from "../store/actions";
import { isFailureSelector } from "../store/selectors";

type ScreenContentType = {
  pictogram: IOPictograms;
  title: string;
  subtitle: string;
  buttonLabel: string;
};

const IdPayUnsubscriptionResultScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isFailure = useIOSelector(isFailureSelector);

  const { pictogram, title, subtitle, buttonLabel }: ScreenContentType =
    isFailure
      ? {
          pictogram: "umbrella",
          title: I18n.t("idpay.unsubscription.failure.title"),
          subtitle: I18n.t("idpay.unsubscription.failure.content"),
          buttonLabel: I18n.t("idpay.unsubscription.failure.button")
        }
      : {
          pictogram: "success",
          title: I18n.t("idpay.unsubscription.success.title"),
          subtitle: I18n.t("idpay.unsubscription.success.content"),
          buttonLabel: I18n.t("idpay.unsubscription.success.button")
        };

  const handleButtonPress = () => {
    dispatch(idPayUnsubscribeAction.cancel());
    if (isFailure) {
      navigation.pop();
    } else {
      navigation.popToTop();
      navigation.navigate(ROUTES.MAIN, {
        screen: ROUTES.WALLET_HOME,
        params: { newMethodAdded: false }
      });
    }
  };

  return (
    <OperationResultScreenContent
      pictogram={pictogram}
      title={title}
      subtitle={subtitle}
      action={{
        label: buttonLabel,
        onPress: handleButtonPress
      }}
    />
  );
};

export default IdPayUnsubscriptionResultScreen;
