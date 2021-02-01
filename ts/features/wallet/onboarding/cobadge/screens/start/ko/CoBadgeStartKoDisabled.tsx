import { Content } from "native-base";
import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { H1 } from "../../../../../../../components/core/typography/H1";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../../../i18n";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../../../utils/emptyContextualHelp";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * The co-badge workflow is not yet available for the selected bank
 * @param _
 * @constructor
 */
const CoBadgeStartKoDisabled = (_: Props): React.ReactElement => (
  <BaseScreenComponent
    goBack={true}
    headerTitle={I18n.t("wallet.onboarding.coBadge.headerTitle")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView style={IOStyles.flex}>
      <Content style={IOStyles.flex}>
        <H1>CoBadgeStartKoDisabled</H1>
      </Content>
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoBadgeStartKoDisabled);
