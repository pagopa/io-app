import { ButtonSolid, H1, IOStyles } from "@pagopa/io-app-design-system";
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
import { useIOSelector } from "../../../../store/hooks";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayCodeSelector } from "../store/selectors";
import { IdPayCodeParamsList } from "../navigation/params";

type IdPayCodeDisplayRouteParams = {
  // If true, means that we are regenerating the code, so we do not need to enroll the code to the initiatives
  isRenew?: boolean;
};

type IdPayCodeDisplayRouteProps = RouteProp<
  IdPayCodeParamsList,
  "IDPAY_CODE_DISPLAY"
>;

const IdPayCodeDisplayScreen = () => {
  const route = useRoute<IdPayCodeDisplayRouteProps>();
  const { isRenew } = route.params;

  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
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
    if (isRenew) {
      navigation.pop();
    } else {
      navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
        screen: IdPayCodeRoutes.IDPAY_CODE_RESULT
      });
    }
  };

  const handleClose = () => {
    navigation.pop();
  };

  const renderButton = () => {
    if (isRenew) {
      return (
        <ButtonSolid
          fullWidth={true}
          label="Chiudi"
          accessibilityLabel="Chiudi"
          onPress={handleClose}
        />
      );
    }

    return (
      <ButtonSolid
        fullWidth={true}
        label="Continua"
        accessibilityLabel="Continua"
        onPress={handleContinue}
      />
    );
  };

  return (
    <BaseScreenComponent>
      <LoadingSpinnerOverlay isLoading={isGeneratingCode} loadingOpacity={1}>
        <ScrollView
          centerContent={true}
          contentContainerStyle={IOStyles.horizontalContentPadding}
        >
          <H1>{idPayCode}</H1>
          {renderButton()}
        </ScrollView>
      </LoadingSpinnerOverlay>
    </BaseScreenComponent>
  );
};

export type { IdPayCodeDisplayRouteParams };
export { IdPayCodeDisplayScreen };
