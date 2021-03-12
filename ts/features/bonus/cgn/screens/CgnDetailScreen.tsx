import React, { useEffect } from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView, ScrollView } from "react-native";
import { constNull } from "fp-ts/lib/function";
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
import { cgnDetailsInformationSelector } from "../store/reducers/details";
import CgnOwnershipInformation from "../components/detail/CgnOwnershipInformation";
import CgnInfoboxDetail from "../components/detail/CgnInfoboxDetail";
import CgnStatusDetail from "../components/detail/CgnStatusDetail";
import { availableBonusTypesSelectorFromId } from "../../bonusVacanze/store/reducers/availableBonusesTypes";
import { ID_CGN_TYPE } from "../../bonusVacanze/utils/bonus";
import { navigateToCgnMerchantsList } from "../navigation/actions";
import CgnCardComponent from "../components/detail/CgnCardComponent";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const HEADER_BACKGROUND_COLOR = "#7CB3D9";
/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    setStatusBarColorAndBackground("dark-content", IOColors.yellowGradientTop);
  }, []);

  return (
    <BaseScreenComponent
      headerBackgroundColor={HEADER_BACKGROUND_COLOR}
      goBack
      headerTitle={I18n.t("bonus.cgn.name")}
      titleColor={"black"}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <ScrollView style={[IOStyles.flex]} bounces={false}>
          <LinearGradient colors={[HEADER_BACKGROUND_COLOR, IOColors.bluegrey]}>
            <View
              style={[IOStyles.horizontalContentPadding, { height: 180 }]}
            />
          </LinearGradient>
          {props.cgnDetails && (
            <CgnCardComponent cgnDetails={props.cgnDetails} />
          )}
          <View
            style={[
              IOStyles.flex,
              IOStyles.horizontalContentPadding,
              { paddingTop: customVariables.contentPadding }
            ]}
          >
            {props.cgnDetails && (
              // Renders the message based on the current status of the card
              <CgnInfoboxDetail cgnDetail={props.cgnDetails} />
            )}
            <View spacer />
            <ItemSeparatorComponent noPadded />
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
            <ItemSeparatorComponent noPadded />
            <View spacer large />
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(
            props.navigateToMerchants,
            I18n.t("bonus.cgn.detail.cta.buyers")
          )}
          rightButton={confirmButtonProps(
            constNull,
            I18n.t("bonus.cgn.detail.cta.otp")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  cgnDetails: cgnDetailsInformationSelector(state),
  cgnBonusInfo: availableBonusTypesSelectorFromId(ID_CGN_TYPE)(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  navigateToMerchants: () => dispatch(navigateToCgnMerchantsList())
});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
