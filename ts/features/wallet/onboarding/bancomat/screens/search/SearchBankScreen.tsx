import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { NavigationActions, NavigationEvents } from "react-navigation";
import { SafeAreaView } from "react-native";
import { Content } from "native-base";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isError,
  isLoading,
  isUndefined
} from "../../../../../bonus/bpd/model/RemoteValue";
import { abiListSelector, abiSelector } from "../../../store/abi";
import { navigateToOnboardingBancomatSearchAvailableUserBancomat } from "../../navigation/action";
import { loadAbi, searchUserPans } from "../../store/actions";
import { fetchPagoPaTimeout } from "../../../../../../config";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import SectionStatusComponent from "../../../../../../components/SectionStatusComponent";
import { SearchBankComponent } from "./SearchBankComponent";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const renderFooterButtons = (onClose: () => void) => (
  <FooterWithButtons
    type={"SingleButton"}
    leftButton={cancelButtonProps(onClose, I18n.t("global.buttons.close"))}
  />
);

/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * @constructor
 */
const SearchBankScreen: React.FunctionComponent<Props> = (props: Props) => {
  // eslint-disable-next-line functional/no-let
  let errorRetry: number | undefined;
  React.useEffect(() => {
    if (isUndefined(props.bankRemoveValue)) {
      props.loadAbis();
    } else if (isError(props.bankRemoveValue)) {
      errorRetry = setTimeout(props.loadAbis, fetchPagoPaTimeout);
    }
  }, [props.bankRemoveValue]);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.searchAbi.header")}
      contextualHelp={emptyContextualHelp}
    >
      <NavigationEvents onDidBlur={() => clearTimeout(errorRetry)} />
      <SafeAreaView style={{ flex: 1 }}>
        <Content style={{ flex: 1 }}>
          <SearchBankComponent
            bankList={props.bankList}
            isLoading={props.isLoading || props.isError}
            onItemPress={props.searchPans}
          />
        </Content>
        <SectionStatusComponent sectionKey={"bancomat"} />
        {renderFooterButtons(props.onBack)}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbis: () => dispatch(loadAbi.request()),
  onBack: () => dispatch(NavigationActions.back()),
  searchPans: (abi?: string) => {
    dispatch(searchUserPans.request(abi));
    dispatch(navigateToOnboardingBancomatSearchAvailableUserBancomat());
  }
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state)),
  bankList: abiListSelector(state),
  bankRemoveValue: abiSelector(state)
});

export default withLightModalContext(
  connect(mapStateToProps, mapDispatchToProps)(SearchBankScreen)
);
