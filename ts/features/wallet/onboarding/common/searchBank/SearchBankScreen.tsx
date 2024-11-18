import { FooterWithButtons } from "@pagopa/io-app-design-system";
import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";
import { useRef } from "react";
import { SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import {
  isError,
  isLoading,
  isUndefined
} from "../../../../../common/model/RemoteValue";
import SectionStatusComponent from "../../../../../components/SectionStatus";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { fetchPagoPaTimeout } from "../../../../../config";
import I18n from "../../../../../i18n";
import { navigateBack } from "../../../../../store/actions/navigation";
import { SectionStatusKey } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { loadAbi } from "../../bancomat/store/actions";
import { abiListSelector, abiSelector } from "../../store/abi";
import { SearchBankComponent } from "./SearchBankComponent";

type MethodType = "bancomatPay" | "bancomat";

type Props = {
  methodType: MethodType;
  onItemPress: (abi?: string) => void;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

const renderFooterButtons = (onClose: () => void) => (
  <FooterWithButtons
    type={"SingleButton"}
    primary={{
      type: "Outline",
      buttonProps: {
        onPress: onClose,
        label: I18n.t("global.buttons.close"),
        accessibilityLabel: I18n.t("global.buttons.close")
      }
    }}
  />
);

const getSectionName = (methodType: MethodType): SectionStatusKey => {
  switch (methodType) {
    case "bancomat":
      return "bancomat";
    case "bancomatPay":
      return "bancomatpay";
  }
};

/**
 * This is the component that defines the base screen where users can find and choose a specific bank
 * to search for a user PagoBANCOMAT / BPay account.
 * @constructor
 */
const SearchBankScreen: React.FunctionComponent<Props> = (props: Props) => {
  const errorRetry = useRef<number | undefined>(undefined);
  const { bankRemoteValue, loadAbis } = props;

  React.useEffect(() => {
    if (isUndefined(bankRemoteValue)) {
      loadAbis();
    } else if (isError(bankRemoteValue)) {
      // eslint-disable-next-line functional/immutable-data
      errorRetry.current = setTimeout(loadAbis, fetchPagoPaTimeout);
    }
  }, [bankRemoteValue, loadAbis]);

  useFocusEffect(React.useCallback(() => clearTimeout(errorRetry.current), []));

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
      <SafeAreaView style={IOStyles.flex}>
        <View style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
          <SearchBankComponent
            bankList={props.bankList}
            isLoading={props.isLoading || props.isError}
            onItemPress={props.onItemPress}
          />
        </View>
        <SectionStatusComponent sectionKey={getSectionName(props.methodType)} />
      </SafeAreaView>
      {renderFooterButtons(props.onBack)}
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbis: () => dispatch(loadAbi.request()),
  onBack: () => navigateBack()
});

const mapStateToProps = (state: GlobalState) => ({
  isLoading: isLoading(abiSelector(state)),
  isError: isError(abiSelector(state)),
  bankList: abiListSelector(state),
  bankRemoteValue: abiSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchBankScreen);
