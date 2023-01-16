import * as pot from "@pagopa/ts-commons/lib/pot";
import { List, Text } from "native-base";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { OperationTypeEnum as IbanOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/IbanOperationDTO";
import { OperationTypeEnum as InstrumentOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/InstrumentOperationDTO";
import { OperationTypeEnum as OnboardingOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/OnboardingOperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/timeline/OperationListDTO";
import { OperationTypeEnum as TransactionOperationTypeEnum } from "../../../../../../definitions/idpay/timeline/TransactionOperationDTO";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../store/hooks";
import { idpayTimelineSelector } from "../store";
import { idpayTimelineGet } from "../store/actions";
import {
  IbanOnboardingCard,
  InstrumentOnboardingCard,
  OnboardingTransactionCard,
  TimelineTransactionCard
} from "./TimelineTransactionCards";

const styles = StyleSheet.create({
  spaceBetween: {
    justifyContent: "space-between"
  }
});

const emptyTimelineContent = (
  <>
    <H3>
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
      )}
    </H3>
    <VSpacer size={16} />
    <LabelSmall weight="Regular" color="bluegreyDark">
      {I18n.t(
        "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsSubtitle"
      )}
      <LabelSmall weight="SemiBold">
        {I18n.t(
          "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperationsLink"
        )}
      </LabelSmall>
    </LabelSmall>
  </>
);

const pickTransactionCard = (transaction: OperationListDTO) => {
  switch (transaction.operationType) {
    case TransactionOperationTypeEnum.TRANSACTION:
      return <TimelineTransactionCard transaction={transaction} />;
    case OnboardingOperationTypeEnum.ONBOARDING:
      return <OnboardingTransactionCard transaction={transaction} />;
    case InstrumentOperationTypeEnum.ADD_INSTRUMENT:
      return <InstrumentOnboardingCard transaction={transaction} />;
    case IbanOperationTypeEnum.ADD_IBAN:
      return <IbanOnboardingCard transaction={transaction} />;
    default:
      return <Text>Error loading {transaction.operationType}</Text>;
  }
};

type Props = {
  initiativeId: string;
};

const ConfiguredInitiativeData = (props: Props) => {
  const { initiativeId } = props;

  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(idpayTimelineGet.request({ initiativeId }));
  }, [dispatch, initiativeId]);

  const timelineFromSelector = useIOSelector(idpayTimelineSelector);
  const isTimelineLoading = pot.isLoading(timelineFromSelector);

  if (isTimelineLoading) {
    return null;
  }

  const timelineList = pot.getOrElse(
    pot.map(timelineFromSelector, timeline => timeline.operationList),
    []
  );

  if (timelineList.length === 0) {
    return emptyTimelineContent;
  }

  return (
    <>
      <View style={[IOStyles.row, styles.spaceBetween]}>
        <H3>
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.yourOperations"
          )}
        </H3>
        <Body weight="SemiBold" color="blue">
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.settings.showMore"
          )}
        </Body>
      </View>
      <VSpacer size={8} />
      <List>
        {timelineList.map(transaction => (
          <React.Fragment key={transaction.operationId}>
            {pickTransactionCard(transaction)}
          </React.Fragment>
        ))}
      </List>
    </>
  );
};

export default ConfiguredInitiativeData;
