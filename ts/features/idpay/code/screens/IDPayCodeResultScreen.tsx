import * as pot from "@pagopa/ts-commons/lib/pot";
import { ButtonSolid, H1 } from "@pagopa/io-app-design-system";
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
import { idPayCodeSelector } from "../store/selectors";

const IdPayCodeResultScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const idPayCodePot = useIOSelector(idPayCodeSelector);

  const isFailure = pot.isLoading(idPayCodePot);

  const handleContinue = () => {
    dispatch(idPayResetCode());
    navigation.popToTop();
  };

  return (
    <BaseScreenComponent>
      <ScrollView centerContent={true}>
        <H1>{isFailure ? ":)" : ":'("}</H1>
        <ButtonSolid
          label="Chiud"
          accessibilityLabel="Chiud"
          onPress={handleContinue}
        />
      </ScrollView>
    </BaseScreenComponent>
  );
};

export { IdPayCodeResultScreen };
