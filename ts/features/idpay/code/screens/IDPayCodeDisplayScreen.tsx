import {
  ButtonSolid,
  H1,
  H3,
  IOStyles,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { ScrollView } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayCodeSelector } from "../store/selectors";
import { IdPayCodeParamsList } from "../navigation/params";
import { idPayEnrollCode } from "../store/actions";

type IdPayCodeDisplayRouteParams = {
  initiativeId?: string;
};

type IdPayCodeDisplayRouteProps = RouteProp<
  IdPayCodeParamsList,
  "IDPAY_CODE_DISPLAY"
>;

const IdPayCodeDisplayScreen = () => {
  const route = useRoute<IdPayCodeDisplayRouteProps>();
  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const idPayCodePot = useIOSelector(idPayCodeSelector);

  const isGeneratingCode = pot.isLoading(idPayCodePot);
  const isFailure = pot.isError(idPayCodePot);
  const idPayCode = pot.getOrElse(idPayCodePot, "");

  React.useEffect(() => {
    if (isFailure) {
      navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    }
  }, [isFailure, navigation]);

  const handleContinue = () => {
    if (initiativeId) {
      dispatch(idPayEnrollCode.request({ initiativeId }));
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    } else {
      navigation.pop();
    }
  };

  return (
    <BaseScreenComponent headerTitle="IdPay Code display">
      <LoadingSpinnerOverlay isLoading={isGeneratingCode} loadingOpacity={1}>
        <ScrollView
          centerContent={true}
          contentContainerStyle={IOStyles.horizontalContentPadding}
        >
          <H1>Ecco il tuo codice</H1>
          <H3>{idPayCode}</H3>
          <VSpacer size={32} />
          <ButtonSolid
            fullWidth={true}
            label={initiativeId !== undefined ? "Chiudi" : "Continua"}
            accessibilityLabel={
              initiativeId !== undefined ? "Chiudi" : "Continua"
            }
            onPress={handleContinue}
          />
        </ScrollView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export type { IdPayCodeDisplayRouteParams };
export { IdPayCodeDisplayScreen };
