import * as React from "react";
import { connect } from "react-redux";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import * as pot from "italia-ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import { H4 } from "../../../../../components/core/typography/H4";
import { Monospace } from "../../../../../components/core/typography/Monospace";
import { profileSelector } from "../../../../../store/reducers/profile";
import I18n from "../../../../../i18n";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

/**
 * Renders the CGN ownership block for detail screen, including Owner's Fiscal Code (The current user logged in)
 * @param props
 * @constructor
 */
const CgnOwnershipInformation = (props: Props): React.ReactElement => (
  <>
    {pot.isSome(props.currentProfile) && (
      <>
        <H4>{I18n.t("bonus.cgn.detail.ownership")}</H4>
        <View spacer />
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
  </>
);

const mapStateToProps = (state: GlobalState) => ({
  currentProfile: profileSelector(state)
});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnOwnershipInformation);
