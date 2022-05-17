import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import image from "../../../../../img/pictograms/payment-completed.png";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

const CdcRequestCompleted = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const onExitPress = () => {
    navigation.getParent()?.goBack();
  };
  return (
    <SafeAreaView style={IOStyles.flex} testID={"cdcRequestCompleted"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.requestCompleted.title"
        )}
        body={I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.requestCompleted.body"
        )}
      />
      <FooterWithButtons
        type="SingleButton"
        leftButton={confirmButtonProps(
          onExitPress,
          I18n.t("bonus.cdc.bonusRequest.bonusRequested.requestCompleted.cta"),
          undefined,
          "closeButton"
        )}
      />
    </SafeAreaView>
  );
};

export default CdcRequestCompleted;
