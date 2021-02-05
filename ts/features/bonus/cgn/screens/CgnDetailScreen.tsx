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
import { profileSelector } from "../../../../store/reducers/profile";
import { Monospace } from "../../../../components/core/typography/Monospace";
import { Link } from "../../../../components/core/typography/Link";
import { cgnDetailSelector } from "../store/reducers/details";
import variables from "../../../../theme/variables";

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

/**
 * Screen to display all the information about the active CGN
 */
const CgnDetailScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    setStatusBarColorAndBackground("dark-content", IOColors.yellowGradientTop);
  }, []);

  return (
    <BaseScreenComponent
      headerBackgroundColor={IOColors.yellowGradientTop}
      goBack
      headerTitle={I18n.t("bonus.cgn.name")}
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
          <H4>{"Chi può usufruire degli sconti?"}</H4>
          <View spacer />
          {pot.isSome(props.currentProfile) && (
            <>
              <View style={styles.rowBlock}>
                <H4
                  weight={"Regular"}
                  color={"bluegrey"}
                >{`${props.currentProfile.value.name} ${props.currentProfile.value.family_name}`}</H4>
                <Monospace>{props.currentProfile.value.fiscal_code}</Monospace>
              </View>
              <View spacer />
            </>
          )}
          <ItemSeparatorComponent noPadded />
          <View spacer />
          <View style={styles.rowBlock}>
            <H4>{"Stato Carta"}</H4>
            <Badge style={styles.statusBadgeActive}>
              <Text style={styles.statusText} semibold={true}>
                {"ATTIVO"}
              </Text>
            </Badge>
          </View>
          <View spacer />
          <View style={styles.rowBlock}>
            <H5 weight={"Regular"} color={"bluegrey"}>
              {"Attivata il"}
            </H5>
            <H5 weight={"Regular"} color={"bluegrey"}>
              {"22/01/2020"}
            </H5>
          </View>
          <View spacer />
          <ItemSeparatorComponent noPadded />
          <View spacer large />
          <View style={styles.verticallyCenter}>
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
  currentProfile: profileSelector(state),
  cgnDetails: cgnDetailSelector(state)
});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(CgnDetailScreen);
