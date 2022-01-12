import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView, ScrollView } from "react-native";
import {
  cgnMerchantVersionSelector,
  isCGNEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { Dispatch } from "../../../../store/actions/types";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { setStatusBarColorAndBackground } from "../../../../utils/statusBar";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import { confirmButtonProps } from "../../bonusVacanze/components/buttons/ButtonConfigurations";
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
  navigateToCgnMerchantsList,
  navigateToCgnMerchantsTabs
} from "../navigation/actions";
import CgnCardComponent from "../components/detail/CgnCardComponent";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { cgnDetails } from "../store/actions/details";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { eycaDetailSelector } from "../store/reducers/eyca/details";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import { navigateBack } from "../../../../store/actions/navigation";
import { useHardwareBackButton } from "../../bonusVacanze/components/hooks/useHardwareBackButton";
import { canEycaCardBeShown } from "../utils/eyca";
import SectionStatusComponent from "../../../../components/SectionStatus";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const HEADER_BACKGROUND_COLOR = "#9184B7";
const GRADIENT_END_COLOR = "#5C488F";

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  const [cardLoading, setCardLoading] = useState(true);

  const loadCGN = () => {
    props.loadCgnDetails();
    props.loadEycaDetails();
  };
  useEffect(() => {
    setStatusBarColorAndBackground("dark-content", HEADER_BACKGROUND_COLOR);
  }, []);

  useActionOnFocus(loadCGN);

  const onCardLoadEnd = () => setCardLoading(false);

  useHardwareBackButton(() => {
    props.goBack();
    return true;
  });

  // to display EYCA info component the CGN initiative needs to be enabled by remote
  const canDisplayEycaDetails =
    canEycaCardBeShown(props.eycaDetails) && props.isCgnEnabled;

  return props.cgnDetails || props.isCgnInfoLoading ? (
    <LoadingSpinnerOverlay isLoading={props.isCgnInfoLoading || cardLoading}>
      <BaseScreenComponent
        headerBackgroundColor={HEADER_BACKGROUND_COLOR}
        goBack
        headerTitle={I18n.t("bonus.cgn.name")}
        dark={true}
        titleColor={"white"}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScrollView style={[IOStyles.flex]} bounces={false}>
            <LinearGradient
              colors={[HEADER_BACKGROUND_COLOR, GRADIENT_END_COLOR]}
            >
              <View
                style={[IOStyles.horizontalContentPadding, { height: 149 }]}
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
              <View spacer extralarge />
              <View spacer xsmall />
              {/* Ownership block rendering owner's fiscal code */}
              <CgnOwnershipInformation />
              <ItemSeparatorComponent noPadded />
              <View spacer />
              {props.cgnDetails && (
                // Renders status information including activation and expiring date and a badge that represents the CGN status
                // ACTIVATED - EXPIRED - REVOKED
                <CgnStatusDetail cgnDetail={props.cgnDetails} />
              )}
              {canDisplayEycaDetails && (
                <>
                  <ItemSeparatorComponent noPadded />
                  <View spacer />
                  <EycaDetailComponent />
                </>
              )}
            </View>
          </ScrollView>
          <SectionStatusComponent sectionKey={"cgn"} />
          {props.isCgnEnabled && (
            <FooterWithButtons
              type={"SingleButton"}
              leftButton={confirmButtonProps(
                props.isMerchantV2Enabled
                  ? props.navigateToMerchantsTabs
                  : props.navigateToMerchantsList,
                I18n.t("bonus.cgn.detail.cta.buyers")
              )}
            />
          )}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  ) : (
    // subText is a blank space to avoid default value when it is undefined
    <GenericErrorComponent
      subText={" "}
      onRetry={loadCGN}
      onCancel={props.goBack}
    />
  );
};

const mapStateToProps = (state: GlobalState) => ({
  cgnDetails: cgnDetailsInformationSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  isCgnInfoLoading: isCgnDetailsLoading(state),
  isMerchantV2Enabled: cgnMerchantVersionSelector(state),
  cgnBonusInfo: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(state),
  eycaDetails: eycaDetailSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => navigateBack(),
  loadEycaDetails: () => dispatch(cgnEycaStatus.request()),
  loadCgnDetails: () => dispatch(cgnDetails.request()),
  navigateToMerchantsList: () => navigateToCgnMerchantsList(),
  navigateToMerchantsTabs: () => navigateToCgnMerchantsTabs(),
  navigateToOtp: () => navigateToCgnDetailsOtp()
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
