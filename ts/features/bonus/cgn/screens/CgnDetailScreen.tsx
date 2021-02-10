import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Badge, Text, View } from "native-base";
import LinearGradient from "react-native-linear-gradient";
import { SafeAreaView, StyleSheet } from "react-native";
import { constNull } from "fp-ts/lib/function";
import * as pot from "italia-ts-commons/lib/pot";
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
import { InfoBox } from "../../../../components/box/InfoBox";
import { H5 } from "../../../../components/core/typography/H5";
import customVariables from "../../../../theme/variables";
import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
import { cgnDetailSelector } from "../store/reducers/details";
import variables from "../../../../theme/variables";
// import { localeDateFormat } from "../../../../utils/locale";
import { CgnActivatedStatus } from "../../../../../definitions/cgn/CgnActivatedStatus";
import { CgnRevokedStatus } from "../../../../../definitions/cgn/CgnRevokedStatus";
import CgnOwnershipInformation from "../components/detail/CgnOwnershipInformation";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  verticallyCenter: {
    flexDirection: "row",
    justifyContent: "center"
  },
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  statusBadgeActive: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.contentPrimaryBackground
  },
  statusBadgeRevoked: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.brandHighLighter
  },
  statusText: {
    fontSize: 12,
    lineHeight: 18
  }
});

const renderRowBlock = (left: React.ReactNode, right: React.ReactNode) => (
  <>
    <View style={styles.rowBlock}>
      {left}
      {right}
    </View>
    <View spacer />
  </>
);

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    setStatusBarColorAndBackground("dark-content", IOColors.yellowGradientTop);
  }, []);

  // const isCgnDetailsAvailable = pot.isSome(props.cgnDetails);

  return (
    <BaseScreenComponent
      headerBackgroundColor={IOColors.yellowGradientTop}
      goBack
      headerTitle={I18n.t("bonus.cgn.name")}
      titleColor={IOColors.black}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <LinearGradient
          colors={[IOColors.yellowGradientTop, IOColors.yellowGradientBottom]}
        >
          <View style={{ height: 164 }} />
        </LinearGradient>
        <View
          style={[
            IOStyles.flex,
            IOStyles.horizontalContentPadding,
            { paddingTop: customVariables.contentPadding }
          ]}
        >
          <View style={styles.verticallyCenter}>
            <InfoBox
              alignedCentral
              iconColor={IOColors.bluegrey}
              iconName={"io-complete"}
            >
              <H5>
                {"La carta è attiva e può essere usata fino al 22/04/2022"}
              </H5>
            </InfoBox>
          </View>
          <View spacer />
          <ItemSeparatorComponent noPadded />
          <View spacer />
          <CgnOwnershipInformation />
          <ItemSeparatorComponent noPadded />
          <View spacer />
          {pot.isSome(props.cgnDetails) &&
            renderRowBlock(
              <H4>{I18n.t("bonus.cgn.detail.status.title")}</H4>,
              CgnActivatedStatus.is(props.cgnDetails.value) ? (
                <Badge style={styles.statusBadgeActive}>
                  <Text style={styles.statusText} semibold={true}>
                    {I18n.t("bonus.cgn.detail.status.badge.active")}
                  </Text>
                </Badge>
              ) : CgnRevokedStatus.is(props.cgnDetails.value) ? (
                <Badge style={styles.statusBadgeActive}>
                  <Text style={styles.statusText} semibold={true}>
                    {I18n.t("bonus.cgn.detail.status.badge.revoked")}
                  </Text>
                </Badge>
              ) : (
                <Badge style={styles.statusBadgeActive}>
                  <Text style={styles.statusText} semibold={true}>
                    {I18n.t("bonus.cgn.detail.status.badge.expired")}
                  </Text>
                </Badge>
              )
            )}
          {pot.isSome(props.cgnDetails) &&
            renderRowBlock(
              <H5 weight={"Regular"} color={"bluegrey"}>
                {I18n.t("bonus.cgn.detail.activationDateLabel")}
              </H5>,
              <H5 weight={"Regular"} color={"bluegrey"}>
                {/* {localeDateFormat(props.cgnDetails.value.)} */}
              </H5>
            )}
          <ItemSeparatorComponent noPadded />
          <View spacer large />
          <View style={styles.verticallyCenter}>
            {/* FIXME Add on press event when TOS are defined */}
            <Link>{"Informativa sul trattamento dei dati personali"}</Link>
          </View>
        </View>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(
            constNull,
            I18n.t("global.buttons.exit")
          )}
          rightButton={confirmButtonProps(
            constNull,
            I18n.t("global.buttons.confirm")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  cgnDetails: cgnDetailSelector(state)
});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
