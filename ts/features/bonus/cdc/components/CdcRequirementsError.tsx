import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import image from "../../../../../img/servicesStatus/error-detail-icon.png";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../../../components/buttons/ButtonConfigurations";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

const CdcRequirementsError = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const onExitPress = () => {
    navigation.getParent()?.goBack();
  };
  return (
    <SafeAreaView style={IOStyles.flex} testID={"cdcRequirementsError"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.ko.requirementsError.title"
        )}
        body={I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.ko.requirementsError.body"
        )}
      />
      <FooterWithButtons
        type="SingleButton"
        leftButton={cancelButtonProps(
          onExitPress,
          I18n.t("global.buttons.close"),
          undefined,
          "closeButton"
        )}
      />
    </SafeAreaView>
  );
};

export default CdcRequirementsError;
