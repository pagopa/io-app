import { FooterActions } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import * as React from "react";
import { SafeAreaView } from "react-native";
import image from "../../../../../img/servicesStatus/error-detail-icon.png";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import I18n from "../../../../i18n";
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
    <>
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
      </SafeAreaView>
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.close"),
            onPress: onExitPress,
            testID: "closeButton"
          }
        }}
      />
    </>
  );
};

export default CdcRequirementsError;
