import * as React from "react";
import { useContext } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../components/core/typography/H1";
import { GlobalState } from "../../../../store/reducers/types";
import I18n from "../../../../i18n";
import { constNull } from "fp-ts/lib/function";
import {
  BottomTopAnimation,
  LightModalContext
} from "../../../../components/ui/LightModal";
import SvVoucherListFilters from "../components/SvVoucherListFilters";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const VoucherListScreen = (_: Props): React.ReactElement => {
  const { showAnimatedModal, hideModal } = useContext(LightModalContext);

  const openFiltersModal = () =>
    showAnimatedModal(
      // TODO replace onConfirm function when the search functionalities are defined
      <SvVoucherListFilters
        onClose={hideModal}
        onConfirm={constNull}
        isLocal={false}
      />,
      BottomTopAnimation
    );

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
      isSearchAvailable={{ enabled: true, onSearchTap: openFiltersModal }}
    >
      <SafeAreaView style={IOStyles.flex} testID={"VoucherListScreen"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("bonus.sv.voucherList.title")}</H1>
        </ScrollView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (_: Dispatch) => ({});
const mapStateToProps = (_: GlobalState) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(VoucherListScreen);
