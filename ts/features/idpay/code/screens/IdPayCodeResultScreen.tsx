import { useNavigation } from "@react-navigation/native";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idPayResetCode } from "../store/actions";
import {
  isIdPayCodeEnrollmentRequestFailureSelector,
  isIdPayCodeEnrollmentRequestLoadingSelector,
  isIdPayCodeFailureSelector
} from "../store/selectors";

const IdPayCodeResultScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const isCodeFailure = useIOSelector(isIdPayCodeFailureSelector);

  const isEnrollmentFailure = useIOSelector(
    isIdPayCodeEnrollmentRequestFailureSelector
  );

  const isEnrollmentLoading = useIOSelector(
    isIdPayCodeEnrollmentRequestLoadingSelector
  );

  const isFailure = isCodeFailure || isEnrollmentFailure;

  const handleClose = () => {
    dispatch(idPayResetCode());
    navigation.pop();
  };

  const screenContent = isFailure ? (
    <OperationResultScreenContent
      pictogram={"umbrella"}
      title={I18n.t(
        `idpay.initiative.discountDetails.IDPayCode.failureScreen.header.GENERIC`
      )}
      action={{
        label: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.failureScreen.cta"
        ),
        accessibilityLabel: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.failureScreen.cta"
        ),
        onPress: handleClose
      }}
    />
  ) : (
    <OperationResultScreenContent
      title={I18n.t(
        `idpay.initiative.discountDetails.IDPayCode.successScreen.header`
      )}
      pictogram="success"
      action={{
        label: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.successScreen.cta"
        ),
        accessibilityLabel: I18n.t(
          "idpay.initiative.discountDetails.IDPayCode.successScreen.cta"
        ),
        onPress: handleClose,
        testID: "actionButtonTestID"
      }}
      subtitle={I18n.t(
        "idpay.initiative.discountDetails.IDPayCode.successScreen.body"
      )}
    />
  );

  return (
    <LoadingSpinnerOverlay isLoading={isEnrollmentLoading} loadingOpacity={1}>
      {screenContent}
    </LoadingSpinnerOverlay>
  );
};

export { IdPayCodeResultScreen };
