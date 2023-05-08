import * as React from "react";

import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { StyleSheet, View } from "react-native";
import { StatusEnum as InitiativeStatusEnum } from "../../../../../../definitions/idpay/InitiativeDTO";
import { IOBadge } from "../../../../../components/core/IOBadge";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import I18n from "../../../../../i18n";
import { formatDateAsLocal } from "../../../../../utils/dates";

type Props = {
  status: InitiativeStatusEnum;
  endDate: Date;
};

const InitiativeStatusLabel = (props: Props) => {
  const { status, endDate } = props;

  const dateString = formatDateAsLocal(endDate, true);

  const badgeComponent = pipe(
    status,
    O.of,
    O.map(status => {
      const text = I18n.t(
        `idpay.initiative.details.initiativeCard.statusLabels.${status}`
      );

      switch (status) {
        case InitiativeStatusEnum.NOT_REFUNDABLE:
        case InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_IBAN:
        case InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT:
        case InitiativeStatusEnum.REFUNDABLE:
          return (
            <IOBadge variant="solid" color="blue" small={true} text={text} />
          );
        case InitiativeStatusEnum.SUSPENDED:
        case InitiativeStatusEnum.UNSUBSCRIBED:
          return (
            <IOBadge
              variant="solid"
              color="blue"
              small={true}
              text={text}
              labelColor="red"
            />
          );
      }
    }),
    O.toUndefined
  );

  const dateComponent = pipe(
    status,
    O.of,
    O.chain(status => {
      switch (status) {
        case InitiativeStatusEnum.NOT_REFUNDABLE:
        case InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_IBAN:
        case InitiativeStatusEnum.NOT_REFUNDABLE_ONLY_INSTRUMENT:
        case InitiativeStatusEnum.REFUNDABLE:
          return O.some(
            I18n.t(`idpay.initiative.details.initiativeCard.validUntil`, {
              expiryDate: dateString
            })
          );
        case InitiativeStatusEnum.SUSPENDED:
        case InitiativeStatusEnum.UNSUBSCRIBED:
          return O.none;
      }
    }),
    O.map(dateString => (
      <>
        <HSpacer size={8} />
        <LabelSmall fontSize="small" weight="SemiBold" color="bluegreyDark">
          {dateString}
        </LabelSmall>
      </>
    )),
    O.toUndefined
  );

  return (
    <View style={styles.bonusStatusContainer}>
      {badgeComponent}
      {dateComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  bonusStatusContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  }
});

export { InitiativeStatusLabel };
