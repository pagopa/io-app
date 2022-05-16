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
import { Anno } from "../../../../../definitions/cdc/Anno";

type Props = {
  successYears: ReadonlyArray<Anno>;
  failedYears: ReadonlyArray<Anno>;
};

const CdcRequestPartiallySuccess = (_: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const onExitPress = () => {
    navigation.getParent()?.goBack();
  };
  return (
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={"Partial"}
        body={I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.requestCompleted.body"
        )}
      />
      <FooterWithButtons
        type="SingleButton"
        leftButton={confirmButtonProps(
          onExitPress,
          I18n.t("bonus.cdc.bonusRequest.bonusRequested.requestCompleted.cta")
        )}
      />
    </SafeAreaView>
  );
};

export default CdcRequestPartiallySuccess;
