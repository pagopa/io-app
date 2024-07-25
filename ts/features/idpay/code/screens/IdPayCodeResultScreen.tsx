import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
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
import useContentWithFF from "../../../../screens/profile/useContentWithFF";

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

  const content = useContentWithFF(
    "idpay.initiative.discountDetails.IDPayCode.successScreen.body"
  );

  const handleClose = () => {
    dispatch(idPayResetCode());
    navigation.pop();
  };

  const screenContent = isFailure ? (
    <OperationResultScreenContent
      title={I18n.t(
        `idpay.initiative.discountDetails.IDPayCode.failureScreen.header.GENERIC`
      )}
      pictogram={"umbrellaNew"}
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
      subtitle={content}
    />
  );

  return (
    <LoadingSpinnerOverlay isLoading={isEnrollmentLoading} loadingOpacity={1}>
      {screenContent}
    </LoadingSpinnerOverlay>
  );
};

export { IdPayCodeResultScreen };
