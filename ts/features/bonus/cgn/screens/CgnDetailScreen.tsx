import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView, ScrollView } from "react-native";
import { GlobalState } from "../../../../store/reducers/types";
import { Dispatch } from "../../../../store/actions/types";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { IOColors } from "../../../../components/core/variables/IOColors";
import { setStatusBarColorAndBackground } from "../../../../utils/statusBar";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import customVariables from "../../../../theme/variables";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import {
  cgnDetailsInformationSelector,
  isCgnDetailsLoading
} from "../store/reducers/details";
import CgnOwnershipInformation from "../components/detail/CgnOwnershipInformation";
import CgnStatusDetail from "../components/detail/CgnStatusDetail";
import { availableBonusTypesSelectorFromId } from "../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_CGN_TYPE } from "../../bonusVacanze/utils/bonus";
import EycaDetailComponent from "../components/detail/eyca/EycaDetailComponent";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import {
  navigateToCgnDetailsOtp,
  navigateToCgnMerchantsList
} from "../navigation/actions";
import CgnCardComponent from "../components/detail/CgnCardComponent";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { cgnDetails } from "../store/actions/details";
import {
  isEycaDetailsLoading,
  isEycaEligible
} from "../store/reducers/eyca/details";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const HEADER_BACKGROUND_COLOR = "#7CB3D9";
/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  const [cardLoading, setCardLoading] = useState(true);

  useEffect(() => {
    setStatusBarColorAndBackground("dark-content", IOColors.yellowGradientTop);
  }, []);

  useActionOnFocus(() => {
    props.loadCgnDetails();
    props.loadEycaDetails();
  });

  const onCardLoadEnd = () => setCardLoading(false);

  return (
    <LoadingSpinnerOverlay isLoading={props.isCgnInfoLoading || cardLoading}>
      <BaseScreenComponent
        headerBackgroundColor={HEADER_BACKGROUND_COLOR}
        goBack
        headerTitle={I18n.t("bonus.cgn.name")}
        titleColor={"black"}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView style={[IOStyles.flex]} bounces={false}>
            <LinearGradient
              colors={[HEADER_BACKGROUND_COLOR, IOColors.bluegrey]}
            >
              <View
                style={[IOStyles.horizontalContentPadding, { height: 180 }]}
              />
            </LinearGradient>
            {props.cgnDetails && (
              <CgnCardComponent
                cgnDetails={props.cgnDetails}
                onCardLoadEnd={onCardLoadEnd}
              />
            )}
            <View
              style={[
                IOStyles.flex,
                IOStyles.horizontalContentPadding,
                { paddingTop: customVariables.contentPadding }
              ]}
            >

              <View spacer />
              {/* Ownership block rendering owner's fiscal code */}
              <CgnOwnershipInformation />
              <ItemSeparatorComponent noPadded />
              <View spacer />
              {props.cgnDetails && (
                // Renders status information including activation and expiring date and a badge that represents the CGN status
                // ACTIVATED - EXPIRED - REVOKED
                <CgnStatusDetail cgnDetail={props.cgnDetails} />
              )}
            {(props.isEycaLoading || props.isEycaEligible) && (
              <>
                <ItemSeparatorComponent noPadded />
                <View spacer />
                <EycaDetailComponent />
              </>
            )}
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(
            props.navigateToMerchants,
            I18n.t("bonus.cgn.detail.cta.buyers")
          )}
          rightButton={confirmButtonProps(
            props.navigateToOtp,
            I18n.t("bonus.cgn.detail.cta.otp")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  cgnDetails: cgnDetailsInformationSelector(state),
  isCgnInfoLoading: isCgnDetailsLoading(state),
  cgnBonusInfo: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(state),
  isEycaEligible: isEycaEligible(state),
  isEycaLoading: isEycaDetailsLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadCgnDetails: () => dispatch(cgnDetails.request()),
  navigateToMerchants: () => dispatch(navigateToCgnMerchantsList()),
  navigateToOtp: () => dispatch(navigateToCgnDetailsOtp()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
