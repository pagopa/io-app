import * as pot from "@pagopa/ts-commons/lib/pot";
import { ButtonSolid, H1, IOStyles } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { ScrollView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { idPayResetCode } from "../store/actions";
import {
  idPayCodeEnrollmentRequestSelector,
  idPayCodeSelector
} from "../store/selectors";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";

const IdPayCodeResultScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const enrollmentRequestPot = useIOSelector(
    idPayCodeEnrollmentRequestSelector
  );
  const idPayCodePot = useIOSelector(idPayCodeSelector);

  const isCodeFailure = pot.isError(idPayCodePot);
  const isEnrollmentFailure = pot.isError(enrollmentRequestPot);
  const isFailure = isCodeFailure || isEnrollmentFailure;

  const isLoading = pot.isLoading(enrollmentRequestPot);

  const handleClose = () => {
    dispatch(idPayResetCode());
    navigation.pop();
  };

  return (
    <BaseScreenComponent>
      <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
        <ScrollView
          centerContent={true}
          contentContainerStyle={IOStyles.horizontalContentPadding}
        >
          <H1>{isFailure ? "Failure ❌" : "Success ✅"}</H1>
          <ButtonSolid
            fullWidth={true}
            label="Chiudi"
            accessibilityLabel="Chiudi"
            onPress={handleClose}
          />
        </ScrollView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export { IdPayCodeResultScreen };
