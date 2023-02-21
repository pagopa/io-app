import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { View, SafeAreaView, ScrollView } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { connect } from "react-redux";
import { StatusEnum } from "../../../../../definitions/cgn/CardActivated";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import GenericErrorComponent from "../../../../components/screens/GenericErrorComponent";
import SectionStatusComponent from "../../../../components/SectionStatus";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { IOStackNavigationProp } from "../../../../navigation/params/AppParamsList";
import { navigateBack } from "../../../../store/actions/navigation";
import { Dispatch } from "../../../../store/actions/types";
import {
  cgnMerchantVersionSelector,
  isCGNEnabledSelector
} from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import customVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { useActionOnFocus } from "../../../../utils/hooks/useOnFocus";
import { confirmButtonProps } from "../../bonusVacanze/components/buttons/ButtonConfigurations";
import { useHardwareBackButton } from "../../../../hooks/useHardwareBackButton";
import { availableBonusTypesSelectorFromId } from "../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_CGN_TYPE } from "../../bonusVacanze/utils/bonus";
import { isLoading } from "../../bpd/model/RemoteValue";
import CgnCardComponent from "../components/detail/CgnCardComponent";
import CgnOwnershipInformation from "../components/detail/CgnOwnershipInformation";
import CgnStatusDetail from "../components/detail/CgnStatusDetail";
import CgnUnsubscribe from "../components/detail/CgnUnsubscribe";
import EycaDetailComponent from "../components/detail/eyca/EycaDetailComponent";
import {
  navigateToCgnMerchantsList,
  navigateToCgnMerchantsTabs
} from "../navigation/actions";
import { CgnDetailsParamsList } from "../navigation/params";
import CGN_ROUTES from "../navigation/routes";
import { cgnDetails } from "../store/actions/details";
import { cgnEycaStatus } from "../store/actions/eyca/details";
import { cgnUnsubscribe } from "../store/actions/unsubscribe";
import {
  cgnDetailSelector,
  cgnDetailsInformationSelector,
  isCgnDetailsLoading
} from "../store/reducers/details";
import { eycaDetailSelector } from "../store/reducers/eyca/details";
import { cgnUnsubscribeSelector } from "../store/reducers/unsubscribe";
import { canEycaCardBeShown } from "../utils/eyca";
import { IOColorGradients } from "../../../../components/core/variables/IOColors";
import { VSpacer } from "../../../../components/core/spacer/Spacer";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const [gradFirstColor, gradSecondColor] = IOColorGradients.cgn;

const HEADER_BACKGROUND_COLOR = gradFirstColor;
const GRADIENT_END_COLOR = gradSecondColor;

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  const [cardLoading, setCardLoading] = useState(true);
  const navigation =
    useNavigation<IOStackNavigationProp<CgnDetailsParamsList, "CGN_DETAILS">>();

  const loadCGN = () => {
    props.loadCgnDetails();
    props.loadEycaDetails();
  };

  useActionOnFocus(loadCGN);

  const onCardLoadEnd = () => setCardLoading(false);

  useHardwareBackButton(() => {
    props.goBack();
    return true;
  });

  // to display EYCA info component the CGN initiative needs to be enabled by remote
  const canDisplayEycaDetails =
    canEycaCardBeShown(props.eycaDetails) && props.isCgnEnabled;

  return (
    <LoadingSpinnerOverlay
      isLoading={
        props.isCgnInfoLoading ||
        (props.cgnDetails && cardLoading) ||
        isLoading(props.unsubscriptionStatus)
      }
    >
      <BaseScreenComponent
        headerBackgroundColor={HEADER_BACKGROUND_COLOR}
        goBack={props.goBack}
        headerTitle={I18n.t("bonus.cgn.name")}
        dark={true}
        titleColor={"white"}
        contextualHelp={emptyContextualHelp}
      >
        <SafeAreaView style={IOStyles.flex}>
          <FocusAwareStatusBar
            backgroundColor={HEADER_BACKGROUND_COLOR}
            barStyle={"light-content"}
          />
          {pot.isError(props.potCgnDetails) ? ( // subText is a blank space to avoid default value when it is undefined
            <GenericErrorComponent
              subText={" "}
              onRetry={loadCGN}
              onCancel={props.goBack}
            />
          ) : (
            <>
              <ScrollView style={IOStyles.flex} bounces={false}>
                {/* cgn gradient */}
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
                  <VSpacer size={48} />

                  {/* Ownership block rendering owner's fiscal code */}
                  <CgnOwnershipInformation />
                  <ItemSeparatorComponent noPadded />
                  <VSpacer size={16} />
                  {props.cgnDetails && (
                    // Renders status information including activation and expiring date and a badge that represents the CGN status
                    // ACTIVATED - EXPIRED - REVOKED
                    <CgnStatusDetail cgnDetail={props.cgnDetails} />
                  )}
                  {canDisplayEycaDetails && (
                    <>
                      <ItemSeparatorComponent noPadded />
                      <VSpacer size={16} />
                      <EycaDetailComponent />
                    </>
                  )}
                  <VSpacer size={24} />
                  <ItemSeparatorComponent noPadded />
                  <CgnUnsubscribe />
                </View>
              </ScrollView>
              <SectionStatusComponent sectionKey={"cgn"} />
              {props.isCgnEnabled &&
                props.cgnDetails?.status === StatusEnum.ACTIVATED && (
                  <FooterWithButtons
                    type={"SingleButton"}
                    leftButton={confirmButtonProps(
                      props.isMerchantV2Enabled
                        ? props.navigateToMerchantsTabs
                        : () =>
                            navigation.navigate(
                              CGN_ROUTES.DETAILS.MERCHANTS.CATEGORIES
                            ),
                      I18n.t("bonus.cgn.detail.cta.buyers")
                    )}
                  />
                )}
            </>
          )}
        </SafeAreaView>
      </BaseScreenComponent>
    </LoadingSpinnerOverlay>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  potCgnDetails: cgnDetailSelector(state),
  cgnDetails: cgnDetailsInformationSelector(state),
  isCgnEnabled: isCGNEnabledSelector(state),
  isCgnInfoLoading: isCgnDetailsLoading(state),
  isMerchantV2Enabled: cgnMerchantVersionSelector(state),
  cgnBonusInfo: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(state),
  eycaDetails: eycaDetailSelector(state),
  unsubscriptionStatus: cgnUnsubscribeSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  unsubscribe: () => dispatch(cgnUnsubscribe.request()),
  goBack: () => navigateBack(),
  loadEycaDetails: () => dispatch(cgnEycaStatus.request()),
  loadCgnDetails: () => dispatch(cgnDetails.request()),
  navigateToMerchantsList: () => navigateToCgnMerchantsList(),
  navigateToMerchantsTabs: () => navigateToCgnMerchantsTabs()
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
