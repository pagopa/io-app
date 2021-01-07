import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView } from "react-native";
import { Content } from "native-base";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { isError, isLoading } from "../../../../bonus/bpd/model/RemoteValue";
import { abiSelector } from "../../store/abi";
import { loadAbi } from "../../bancomat/store/actions";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import SectionStatusComponent from "../../../../../components/SectionStatusComponent";
import { SearchStartComponent } from "./SearchStartComponent";

type Props = {
  methodName: string;
  onSearch: (abi?: string) => void;
  navigateToSearchBank: () => void;
  onCancel: () => void;
  handleTosModal: () => void;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const renderFooterButtons = (onCancel: () => void, onContinue: () => void) => (
  <FooterWithButtons
    type={"TwoButtonsInlineThird"}
    leftButton={cancelButtonProps(onCancel, I18n.t("global.buttons.cancel"))}
    rightButton={confirmButtonProps(
      onContinue,
      I18n.t("global.buttons.continue")
    )}
  />
);

/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * @constructor
 */
const SearchStartScreen: React.FunctionComponent<Props> = (props: Props) => {
  const onContinueHandler = () => {
    props.onSearch();
  };
  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.searchAbi.header", {
        methodName: props.methodName
      })}
      contextualHelp={emptyContextualHelp}
    >
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          <SearchStartComponent
            openTosModal={props.handleTosModal}
            onSearch={props.navigateToSearchBank}
            methodName={props.methodName}
          />
        </Content>
        <SectionStatusComponent sectionKey={"bancomat"} />
        {renderFooterButtons(props.onCancel, onContinueHandler)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbis: () => dispatch(loadAbi.request())
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state))
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchStartScreen);
