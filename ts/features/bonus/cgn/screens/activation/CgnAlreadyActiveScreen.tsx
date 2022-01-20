import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { InfoScreenComponent } from "../../../../../components/infoScreen/InfoScreenComponent";
import { renderInfoRasterImage } from "../../../../../components/infoScreen/imageRendering";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { cgnActivationCancel } from "../../store/actions/activation";
import image from "../../../../../../img/messages/empty-due-date-list-icon.png";
import I18n from "../../../../../i18n";
import { navigateToCgnDetails } from "../../navigation/actions";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { isCgnDetailsLoading, isCgnEnrolledSelector } from "../../store/reducers/details";
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
        leftButton={confirmButtonProps(
          () => dispatch(cgnActivationCancel()),
          I18n.t("global.buttons.exit")
        )}
      />
    </SafeAreaView>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToDetail: () => {
    dispatch(cgnActivationCancel());
    navigateToCgnDetails();
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnAlreadyActiveScreen);
