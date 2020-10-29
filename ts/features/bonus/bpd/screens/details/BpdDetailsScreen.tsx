import * as React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import DarkLayout from "../../../../../components/screens/DarkLayout";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import BpdPeriodDetail from "./BpdPeriodDetail";
import BpdPeriodSelector from "./BpdPeriodSelector";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 172
  },
  selector: {
    height: 192 + 10 + 16 + 16,
    width: "100%",
    position: "absolute",
    top: 16,
    zIndex: 7,
    elevation: 7
  },
  selectorSpacer: {
    height: 60
  }
});
/**
 * The screen that allows the user to see all the details related to the bpd.
 * @constructor
 */
const BpdDetailsScreen: React.FunctionComponent<Props> = () => (
  <DarkLayout
    bounces={false}
    title={I18n.t("bonus.bpd.name")}
    faqCategories={["bonus_detail"]}
    allowGoBack={true}
    topContent={<View style={styles.headerSpacer} />}
    gradientHeader={true}
    hideHeader={true}
  >
    <View style={styles.selector}>
      <BpdPeriodSelector />
    </View>
    <View style={styles.selectorSpacer} />
    <BpdPeriodDetail />
  </DarkLayout>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdDetailsScreen);
