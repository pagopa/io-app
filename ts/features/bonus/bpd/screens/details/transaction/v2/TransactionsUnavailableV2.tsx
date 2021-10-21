import * as React from "react";
import { SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import image from "../../../../../../../../img/wallet/errors/payment-unavailable-icon.png";
import { IOStyles } from "../../../../../../../components/core/variables/IOStyles";
import { renderInfoRasterImage } from "../../../../../../../components/infoScreen/imageRendering";
import { InfoScreenComponent } from "../../../../../../../components/infoScreen/InfoScreenComponent";
import BaseScreenComponent from "../../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../../i18n";
import { navigateBack } from "../../../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../../../store/reducers/types";
import {
  cancelButtonProps,
  confirmButtonProps
} from "../../../../../bonusVacanze/components/buttons/ButtonConfigurations";
import { AwardPeriodId } from "../../../../store/actions/periods";
import { bpdTransactionsLoadRequiredData } from "../../../../store/actions/transactions";
import { bpdSelectedPeriodSelector } from "../../../../store/reducers/details/selectedPeriod";

export type Props = Pick<
  React.ComponentProps<typeof BaseScreenComponent>,
  "contextualHelp"
> &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const loadLocales = () => ({
  headerTitle: I18n.t("bonus.bpd.details.transaction.goToButton"),
  title: I18n.t("bonus.bpd.details.transaction.error.title"),
  body: I18n.t("bonus.bpd.details.transaction.error.body")
});

/**
 * This screen informs the user that there are problems retrieving the transactions list.
 * Replace TransactionsUnavailable, adding also the retry button
 * @constructor
 */
const TransactionsUnavailableV2Base: React.FunctionComponent<Props> = props => {
  const { headerTitle, title, body } = loadLocales();

  return (
    <BaseScreenComponent
      goBack={true}
      headerTitle={headerTitle}
      contextualHelp={props.contextualHelp}
    >
      <SafeAreaView style={IOStyles.flex} testID={"TransactionUnavailableV2"}>
        <InfoScreenComponent
          image={renderInfoRasterImage(image)}
          title={title}
          body={body}
        />
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={cancelButtonProps(props.cancel)}
          rightButton={confirmButtonProps(
            () =>
              props.selectedPeriod
                ? props.retry(props.selectedPeriod.awardPeriodId)
                : props.cancel(),
            I18n.t("global.buttons.retry")
          )}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => navigateBack(),
  retry: (periodId: AwardPeriodId) =>
    dispatch(bpdTransactionsLoadRequiredData.request(periodId))
});

const mapStateToProps = (state: GlobalState) => ({
  selectedPeriod: bpdSelectedPeriodSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransactionsUnavailableV2Base);
