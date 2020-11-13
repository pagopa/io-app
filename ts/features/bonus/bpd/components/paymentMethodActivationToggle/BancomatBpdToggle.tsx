import * as React from "react";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { Dispatch } from "redux";
import pagoBancomatImage from "../../../../../../img/wallet/cards-icons/pagobancomat.png";
import {
  EnableableFunctionsTypeEnum,
  PatchedWalletV2
} from "../../../../../types/pagopa";
import { HPan } from "../../store/actions/paymentMethods";
import { hasFunctionEnabled } from "../../../../../utils/walletv2";
import I18n from "../../../../../i18n";
import { getValueOrElse, isReady } from "../../model/RemoteValue";
import { GlobalState } from "../../../../../store/reducers/types";
import { loadAbi } from "../../../../wallet/onboarding/bancomat/store/actions";
import { useActionOnFocus } from "../../../../../utils/hooks/useOnFocus";
import { abiSelector } from "../../../../wallet/onboarding/store/abi";
import PaymentMethodBpdToggle from "./base/PaymentMethodBpdToggle";

type Props = {
  card: PatchedWalletV2;
} & ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

/**
 * Customize a {@link PaymentMethodBpdToggle} with the data from a Bancomat
 * @param props
 * @constructor
 */
const BancomatBpdToggle: React.FunctionComponent<Props> = props => {
  const [abiDescription, setAbiDescription] = React.useState(
    I18n.t("wallet.methods.bancomat.name")
  );

  // when the component is focused
  // load abi if abi list is empty and card has a valid issuerAbiCode
  useActionOnFocus(() => {
    if (props.card.info.issuerAbiCode && !isReady(props.abis)) {
      props.loadAbi();
    }
  });

  React.useEffect(() => {
    fromNullable(props.card.info.issuerAbiCode).map(iac => {
      fromNullable(getValueOrElse(props.abis, null))
        .map(abi => abi[iac])
        .chain(fromNullable)
        .map(a => a.name)
        .chain(fromNullable)
        .map(setAbiDescription);
    });
  }, [props.abis]);

  return (
    <PaymentMethodBpdToggle
      hPan={props.card.info.hashPan as HPan}
      icon={pagoBancomatImage}
      hasBpdCapability={hasFunctionEnabled(
        props.card,
        EnableableFunctionsTypeEnum.BPD
      )}
      caption={abiDescription}
    />
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  loadAbi: () => dispatch(loadAbi.request())
});

const mapStateToProps = (state: GlobalState) => ({
  abis: abiSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(BancomatBpdToggle);
