import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { NavigationEvents } from "react-navigation";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import { GlobalState } from "../../../../../../store/reducers/types";
import I18n from "../../../../../../i18n";
import { navigateBack } from "../../../../../../store/actions/navigation";
import { withLightModalContext } from "../../../../../../components/helpers/withLightModalContext";
import { LightModalContextInterface } from "../../../../../../components/ui/LightModal";
import TosBonusComponent from "../../../../../bonus/bonusVacanze/components/TosBonusComponent";
import { loadAbi } from "../../store/actions";
import {
  isError,
  isLoading,
  isUndefined
} from "../../../../../bonus/bpd/model/RemoteValue";
import { abiListSelector, abiSelector } from "../../../store/abi";
import { SearchBankComponent } from "./SearchBankComponent";

type Props = LightModalContextInterface &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;
/**
 * This screen allows the user to choose a specific bank to search for their Bancomat.
 * the user can also choose not to specify any bank and search for all Bancomat in his name
 * @constructor
 */
const SearchBankScreen: React.FunctionComponent<Props> = (props: Props) => {
  // eslint-disable-next-line functional/no-let
  let errorRetry: number | undefined;
  React.useEffect(() => {
    if (isUndefined(props.bankRemoveValue)) {
      props.loadAbis();
    } else if (isError(props.bankRemoveValue)) {
      errorRetry = setTimeout(props.loadAbis, 2000);
    }
  }, [props.bankRemoveValue]);

  const openTosModal = () => {
    props.showModal(
      <TosBonusComponent
        tos_url={"https://google.com"}
        onClose={props.hideModal}
      />
    );
  };

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.searchAbi.title")}
    >
      <NavigationEvents onDidBlur={() => clearTimeout(errorRetry)} />
      <SearchBankComponent
        bankList={props.bankList}
        isLoading={props.isLoading || props.isError}
        onCancel={props.onCancel}
        onContinue={props.onContinue}
        onItemPress={props.onItemPress}
        openTosModal={openTosModal}
      />
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbis: () => dispatch(loadAbi.request()),
  onCancel: () => dispatch(navigateBack()),
  onItemPress: (_abi: string) => null,
  onContinue: () => null
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
