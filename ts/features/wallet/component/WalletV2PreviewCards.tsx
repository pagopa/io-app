import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../store/reducers/types";
import {
  bancomatListSelector,
  satispayListSelector
} from "../../../store/reducers/wallet/wallets";
import BancomatWalletPreview from "../bancomat/component/BancomatWalletPreview";
import SatispayCard from "../satispay/SatispayCard";
import SatispayWalletPreview from "../satispay/SatispayWalletPreview";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * The new wallet preview that renders all the new v2 methods.
 * Atm the legacy types (credit card) are rendered with the old method.
 * TODO: will render also satispay, bancomat pay
 * @constructor
 */
const WalletV2PreviewCards: React.FunctionComponent<Props> = props => (
  <>
    {pot.getOrElse(
      pot.map(props.bancomatList, b => (
        <>
          {b.map(enhancedBancomat => (
            <BancomatWalletPreview
              key={enhancedBancomat.idWallet}
              bancomat={enhancedBancomat}
            />
          ))}
        </>
      )),
      null
    )}
    {pot.getOrElse(
      pot.map(props.satispayList, s => (
        <>
          {s.map((_, i) => (
            <SatispayCard key={`satispay_card_${i}`} />
          ))}
        </>
      )),
      null
    )}
  </>
);

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  bancomatList: bancomatListSelector(state),
  satispayList: satispayListSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletV2PreviewCards);
