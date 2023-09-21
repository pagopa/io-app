import { ButtonSolid, IOStyles } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { ScrollView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { IdPayCodeRoutes } from "../navigation/routes";
import { idPayGenerateCode } from "../store/actions";

const IdPayCodeRenewScreen = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const dispatch = useIODispatch();

  const handleContinue = () => {
    dispatch(idPayGenerateCode.request({}));
    navigation.replace(IdPayCodeRoutes.IDPAY_CODE_MAIN, {
      screen: IdPayCodeRoutes.IDPAY_CODE_DISPLAY,
      params: {}
    });
  };

  return (
    <BaseScreenComponent>
      <ScrollView
        centerContent={true}
        contentContainerStyle={IOStyles.horizontalContentPadding}
      >
        <ButtonSolid
          fullWidth={true}
          label="Rigenera"
          accessibilityLabel="Rigenera"
          onPress={handleContinue}
        />
      </ScrollView>
    </BaseScreenComponent>
  );
};

export { IdPayCodeRenewScreen };
