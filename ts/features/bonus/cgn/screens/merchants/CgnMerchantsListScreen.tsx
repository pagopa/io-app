import * as React from "react";
import { connect } from "react-redux";
import { SafeAreaView } from "react-native";
import { View } from "native-base";
import { GlobalState } from "../../../../../store/reducers/types";
import { Dispatch } from "../../../../../store/actions/types";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import CgnMerchantListItem from "../../components/merchants/CgnMerchantListItem";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const CgnMerchantsListScreen: React.FunctionComponent<Props> = (_: Props) => (
  <BaseScreenComponent
    goBack
    headerTitle={I18n.t("bonus.cgn.name")}
    contextualHelp={emptyContextualHelp}
  >
    <SafeAreaView style={IOStyles.flex}>
      <View style={[IOStyles.horizontalContentPadding, IOStyles.flex]}>
        <CgnMerchantListItem
          category={"aaaaa"}
          name={"Nome di esercente"}
          location={"www.location.it"}
        />
      </View>
    </SafeAreaView>
  </BaseScreenComponent>
);

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (_: Dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CgnMerchantsListScreen);
