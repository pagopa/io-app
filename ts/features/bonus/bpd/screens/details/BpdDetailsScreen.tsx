import * as React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../components/core/typography/H1";
import DarkLayout from "../../../../../components/screens/DarkLayout";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  headerSpacer: {
    height: 172
  }
});

const BpdDetailsScreen: React.FunctionComponent<Props> = () => (
  <DarkLayout
    bounces={false}
    title={I18n.t("bonus.bonusVacanze.name")}
    faqCategories={["bonus_detail"]}
    allowGoBack={true}
    topContent={<View style={styles.headerSpacer} />}
    gradientHeader={true}
    hideHeader={true}
  >
    <H1>Ciao</H1>
  </DarkLayout>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BpdDetailsScreen);
