import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";
import IconFont from "../../../../../../components/ui/IconFont";
import I18n from "../../../../../../i18n";
import { GlobalState } from "../../../../../../store/reducers/types";
import { navigateToBpdTransactions } from "../../../navigation/actions";
import { AwardPeriodId } from "../../../store/actions/periods";
import { bpdTransactionsLoad } from "../../../store/actions/transactions";
import { bpdSelectedPeriodSelector } from "../../../store/reducers/details/selectedPeriod";
import { bpdTransactionsForSelectedPeriod } from "../../../store/reducers/details/transactions";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * Display the transactions button only if the transactions number are > 0 for the selected period
 * (never displayed for inactive period)
 * @param props
 * @constructor
 */
const GoToTransactions: React.FunctionComponent<Props> = props => {
  const canRenderButton = pot.getOrElse(
    pot.map(props.transactions, val => val.length > 0),
    false
  );

  return canRenderButton ? (
    <ButtonDefaultOpacity
      block={true}
      onPress={props.goToTransactions}
      activeOpacity={1}
    >
      <IconFont name="io-transactions" size={24} color={"white"} />
      <Label color={"white"}>
        {I18n.t("bonus.bpd.details.transaction.goToButton")}
      </Label>
    </ButtonDefaultOpacity>
  ) : null;
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goToTransactions: () => dispatch(navigateToBpdTransactions()),
  loadTransactionsByPeriod: (periodId: AwardPeriodId) =>
    dispatch(bpdTransactionsLoad.request(periodId))
});

const mapStateToProps = (state: GlobalState) => ({
  transactions: bpdTransactionsForSelectedPeriod(state),
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(mapStateToProps, mapDispatchToProps)(GoToTransactions);
