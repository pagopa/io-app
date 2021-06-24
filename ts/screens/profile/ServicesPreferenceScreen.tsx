import * as React from "react";
import { ScrollView } from "react-native";
import { connect } from "react-redux";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../utils/emptyContextualHelp";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { GlobalState } from "../../store/reducers/types";
import { Dispatch } from "../../store/actions/types";
import { servicesOptinCompleted } from "../../store/actions/onboarding";
import ServicesContactComponent from "./components/services/ServicesContactComponent";
import { useManualConfigBottomSheet } from "./components/services/ManualConfigBottomSheet";

type Props = ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const ServicesPreferenceScreen = (props: Props): React.ReactElement => {
  const { present: confirmManualConfig } = useManualConfigBottomSheet();

  const onSelectAction = (optionKey: string) =>
    optionKey === "manual"
      ? confirmManualConfig(props.onSelect)
      : props.onSelect();

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("profile.preferences.list.service_contact")}
    >
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <ServicesContactComponent onSelectOption={onSelectAction} />
      </ScrollView>
    </BaseScreenComponent>
  );
};

const mapStateToProps = (_: GlobalState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  // TODO Replace with the correct action when available
  onSelect: () => dispatch(servicesOptinCompleted())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ServicesPreferenceScreen);
