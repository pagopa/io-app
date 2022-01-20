import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { cgnActivationCancel } from "../../store/actions/activation";
import image from "../../../../../../img/messages/empty-due-date-list-icon.png";
import I18n from "../../../../../i18n";
import { navigateToCgnDetails } from "../../navigation/actions";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import {
  isCgnDetailsLoading,
  isCgnEnrolledSelector
} from "../../store/reducers/details";
import { cgnDetails } from "../../store/actions/details";
import ActivityIndicator from "../../../../../components/ui/ActivityIndicator";

/**
 * Screen which is displayed when a user requested a CGN activation
 * but it is yet active
 */
const CgnAlreadyActiveScreen = (): React.ReactElement => {
  const dispatch = useIODispatch();
  const navigateToDetail = () => {
    dispatch(cgnActivationCancel());
    navigateToCgnDetails();
  };
  useEffect(() => {
    dispatch(cgnDetails.request());
  }, []);

  const isCgnEnrolled = useIOSelector(isCgnEnrolledSelector);
  const isCGNloading = useIOSelector(isCgnDetailsLoading);

  if (isCGNloading) {
    return <ActivityIndicator />;
  }
  if (isCgnEnrolled) {
    return (
      <SafeAreaView style={IOStyles.flex}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={I18n.t("bonus.cgn.activation.alreadyActive.title")}
          body={I18n.t("bonus.cgn.activation.alreadyActive.body")}
        />
        <FooterWithButtons
          type="SingleButton"
          leftButton={confirmButtonProps(
            navigateToDetail,
            I18n.t("bonus.cgn.cta.goToDetail")
          )}
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={IOStyles.flex}>
      <InfoScreenComponent
        image={renderInfoRasterImage(image)}
        title={
          "Non è possibile attivare la CGN perché in uno stato inconsistente"
        }
        body={I18n.t("bonus.cgn.activation.error.body")}
      />
      <FooterWithButtons
        type="SingleButton"
        leftButton={cancelButtonProps(
          () => dispatch(cgnActivationCancel()),
          I18n.t("global.buttons.close")
        )}
      />
    </SafeAreaView>
  );
};

export default CgnAlreadyActiveScreen;
