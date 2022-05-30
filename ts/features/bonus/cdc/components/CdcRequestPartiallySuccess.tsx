import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { InfoScreenComponent } from "../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../components/infoScreen/imageRendering";
import image from "../../../../../img/wallet/errors/payment-unknown-icon.png";
import I18n from "../../../../i18n";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { cancelButtonProps } from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { cdcEnrollUserToBonusSelector } from "../store/reducers/cdcBonusRequest";
import { useIOSelector } from "../../../../store/hooks";
import { isReady } from "../../bpd/model/RemoteValue";
import { RequestOutcomeEnum } from "../types/CdcBonusRequest";
import CdcGenericError from "./CdcGenericError";

const CdcRequestPartiallySuccess = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const cdcEnrollUserToBonus = useIOSelector(cdcEnrollUserToBonusSelector);

  const onExitPress = () => {
    navigation.getParent()?.goBack();
  };

  // Should never occurs
  if (
    !isReady(cdcEnrollUserToBonus) ||
    cdcEnrollUserToBonus.value.kind !== "partialSuccess"
  ) {
    return <CdcGenericError />;
  }

  const receivedBonus = cdcEnrollUserToBonus.value.value;
  const successfulYears = receivedBonus
    .filter(b => b.outcome === RequestOutcomeEnum.OK)
    .map(b => b.year)
    .join(", ");

  const failedYears = receivedBonus
    .filter(b => b.outcome !== RequestOutcomeEnum.OK)
    .map(b => b.year)
    .join(", ");

  return (
    <SafeAreaView style={IOStyles.flex} testID={"cdcRequestPartiallySuccess"}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.title"
        )}
        body={`${I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.success",
          { successfulYears }
        )} ${I18n.t(
          "bonus.cdc.bonusRequest.bonusRequested.partiallySuccess.body.fail",
          { failedYears }
        )}`}
      />
      <FooterWithButtons
        type="SingleButton"
        leftButton={cancelButtonProps(
          onExitPress,
          I18n.t("bonus.cdc.bonusRequest.bonusRequested.requestCompleted.cta"),
          undefined,
          "closeButton"
        )}
      />
    </SafeAreaView>
  );
};

export default CdcRequestPartiallySuccess;
