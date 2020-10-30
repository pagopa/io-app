import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { View } from "native-base";
import { H1 } from "../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Display all the transactions for a specific period
 * @constructor
 */
const BpdTransactionsScreen: React.FunctionComponent<Props> = () => (
  <BaseScreenComponent goBack={true} headerTitle={I18n.t("bonus.bpd.title")}>
    <SafeAreaView style={IOStyles.flex}>
      <View style={IOStyles.horizontalContentPadding}>
        <View spacer={true} large={true} />
        <H1>{I18n.t("bonus.bpd.details.transaction.title")}</H1>
      </View>
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BpdTransactionsScreen);
