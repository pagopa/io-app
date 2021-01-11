import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { NavigationActions, NavigationEvents } from "react-navigation";
import { SafeAreaView } from "react-native";
import { Content } from "native-base";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  isError,
  isLoading,
  isUndefined
} from "../../../../bonus/bpd/model/RemoteValue";
import { abiListSelector, abiSelector } from "../../store/abi";
import { loadAbi } from "../../bancomat/store/actions";
import { fetchPagoPaTimeout } from "../../../../../config";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { cancelButtonProps } from "../../../../bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import SectionStatusComponent from "../../../../../components/SectionStatusComponent";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { SearchBankComponent } from "./SearchBankComponent";

type Props = {
  methodType: "bancomatPay" | "bancomat";
  onItemPress: (abi?: string) => void;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const renderFooterButtons = (onClose: () => void) => (
  <FooterWithButtons
    type={"SingleButton"}
    leftButton={cancelButtonProps(onClose, I18n.t("global.buttons.close"))}
  />
);

/**
 * This is the component that defines the base screen where users can find and choose a specific bank
 * to search for a user PagoBANCOMAT / BPay account.
 * @constructor
 */
const SearchBankScreen: React.FunctionComponent<Props> = (props: Props) => {
  // eslint-disable-next-line functional/no-let
  let errorRetry: number | undefined;
  React.useEffect(() => {
    if (isUndefined(props.bankRemoteValue)) {
      props.loadAbis();
    } else if (isError(props.bankRemoteValue)) {
      errorRetry = setTimeout(props.loadAbis, fetchPagoPaTimeout);
    }
  }, [props.bankRemoteValue]);

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={I18n.t("wallet.searchAbi.header", {
        methodName:
          props.methodType === "bancomat"
            ? I18n.t("wallet.methods.pagobancomat.name")
            : I18n.t("wallet.methods.bancomatPay.name")
      })}
      contextualHelp={emptyContextualHelp}
    >
      <NavigationEvents onDidBlur={() => clearTimeout(errorRetry)} />
      <SafeAreaView style={IOStyles.flex}>
        <Content style={IOStyles.flex}>
          <SearchBankComponent
            bankList={props.bankList}
            isLoading={props.isLoading || props.isError}
            onItemPress={props.onItemPress}
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
  onBack: () => dispatch(NavigationActions.back())
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state)),
  bankList: abiListSelector(state),
  bankRemoteValue: abiSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBankScreen);
