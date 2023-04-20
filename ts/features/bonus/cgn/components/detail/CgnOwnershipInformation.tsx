import * as pot from "@pagopa/ts-commons/lib/pot";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H4 } from "../../../../../components/core/typography/H4";
import { Monospace } from "../../../../../components/core/typography/Monospace";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { Dispatch } from "../../../../../store/actions/types";
import { profileSelector } from "../../../../../store/reducers/profile";
import { GlobalState } from "../../../../../store/reducers/types";

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
        <VSpacer size={16} />
        <View style={styles.rowBlock}>
          <H4
            weight={"Regular"}
            color={"bluegrey"}
            style={IOStyles.flex}
          >{`${props.currentProfile.value.name} ${props.currentProfile.value.family_name}`}</H4>
          <Monospace>{props.currentProfile.value.fiscal_code}</Monospace>
        </View>
        <VSpacer size={16} />
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
