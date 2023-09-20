import { ButtonSolid } from "@pagopa/io-app-design-system";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as React from "react";
import { ScrollView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { IdPayCodeRoutes } from "../navigation/routes";
import { isIdPayCodeOnboardedSelector } from "../store/selectors";
import { IdPayCodeParamsList } from "../navigation/params";
import { idPayEnrollCode, idPayGenerateCode } from "../store/actions";

type IdPayCodeOnboardingRouteParams = {
  initiativeId?: string;
};

type IdPayCodeOnboardingRouteProps = RouteProp<
  IdPayCodeParamsList,
  "IDPAY_CODE_ONBOARDING"
>;

const IdPayCodeOnboardingScreen = () => {
  const route = useRoute<IdPayCodeOnboardingRouteProps>();
  const { initiativeId } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const isCodeOnboarded = useIOSelector(isIdPayCodeOnboardedSelector);

  const handleContinue = () => {
    if (isCodeOnboarded && initiativeId !== undefined) {
      dispatch(idPayEnrollCode.request({ initiativeId }));
      navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    } else {
      dispatch(idPayGenerateCode.request({ initiativeId }));
      navigation.navigate(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_DISPLAY,
        params: {
          isRenew: false
        }
      });
    }
  };

  return (
    <BaseScreenComponent>
      <ScrollView centerContent={true}>
        <ButtonSolid
          label="Continua"
          accessibilityLabel="Continua"
          onPress={handleContinue}
        />
      </ScrollView>
    </BaseScreenComponent>
  );
};

export type { IdPayCodeOnboardingRouteParams };
export { IdPayCodeOnboardingScreen };
