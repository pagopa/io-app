import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import {
  InitiativeDTO,
  InitiativeRewardTypeEnum,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../../definitions/idpay/InitiativeDTO";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../components/core/typography/LabelSmall";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import I18n from "../../../../../i18n";
import { Skeleton } from "../../../common/components/Skeleton";
import { InitiativeBonusCounter } from "./InitiativeBonusCounter";
import { InitiativeStatusLabel } from "./InitiativeStatusLabel";

type Props = {
  initiative: InitiativeDTO;
};

const InitiativeCardComponent = (props: Props) => {
  const { initiative } = props;

  const { initiativeName, endDate, status } = initiative;

  const logoComponent = pipe(
    NonEmptyString.decode(initiative.logoURL),
    O.fromEither,
    O.fold(
      () => undefined,
      logoUrl => (
        <Image source={{ uri: logoUrl }} style={styles.initiativeLogo} />
      )
    )
  );

  const renderCounters = () => {
    const isInitiativeConfigured = status === InitiativeStatusEnum.REFUNDABLE;

    const totalAmount = pipe(
      sequenceS(O.Monad)({
        amount: O.fromNullable(initiative.amount),
        accrued: O.fromNullable(initiative.accrued)
      }),
      O.map(({ amount, accrued }) => amount + accrued),
      O.toUndefined
    );

    const refundableAmount = pipe(
      sequenceS(O.Monad)({
        accrued: O.fromNullable(initiative.accrued),
        refunded: O.fromNullable(initiative.refunded)
      }),
      O.map(({ accrued, refunded }) => accrued - refunded),
      O.toUndefined
    );

    if (initiative.initiativeRewardType === InitiativeRewardTypeEnum.REFUND) {
      return (
        <>
          <InitiativeBonusCounter
            type="AmountWithProgress"
            label={I18n.t(
              "idpay.initiative.details.initiativeCard.availableAmount"
            )}
            amount={initiative.amount || 0}
            total={totalAmount || 0}
            isDisabled={!isInitiativeConfigured}
          />
          <HSpacer size={48} />
          <InitiativeBonusCounter
            type="Amount"
            label={I18n.t("idpay.initiative.details.initiativeCard.toRefund")}
            amount={refundableAmount || 0}
            isDisabled={!isInitiativeConfigured}
          />
        </>
      );
    }

    if (initiative.initiativeRewardType === InitiativeRewardTypeEnum.DISCOUNT) {
      return (
        <InitiativeBonusCounter
          type="AmountWithProgress"
          label={I18n.t(
            "idpay.initiative.details.initiativeCard.availableAmount"
          )}
          amount={initiative.amount || 0}
          total={totalAmount || 0}
        />
      );
    }

    return undefined;
  };

  return (
    <View style={styles.hero} testID={"card-component"}>
      <ContentWrapper>
        <View style={styles.heroDetails}>
          {logoComponent}
          <H1 style={styles.initiativeName}>{initiativeName}</H1>
          <LabelSmall color={"black"} weight="Regular">
            {initiative.organizationName}
          </LabelSmall>
          <VSpacer size={8} />
          <InitiativeStatusLabel status={initiative.status} endDate={endDate} />
        </View>
        <VSpacer size={32} />
        <View style={styles.heroCounters}>{renderCounters()}</View>
      </ContentWrapper>
    </View>
  );
};

const InitiativeCardComponentSkeleton = () => (
  <View style={styles.hero} testID={"card-component"}>
    <View style={styles.heroDetails}>
      <Skeleton height={56} width={56} color="#CED8F9" />
      <VSpacer size={16} />
      <Skeleton height={24} width={180} color="#CED8F9" />
      <VSpacer size={8} />
      <Skeleton height={16} width={100} color="#CED8F9" />
      <VSpacer size={8} />
      <Skeleton height={16} width={100} color="#CED8F9" />
    </View>
    <VSpacer size={32} />
    <View style={styles.heroCounters}>
      <InitiativeBonusCounter type="AmountWithProgress" isLoading={true} />
      <HSpacer size={48} />
      <InitiativeBonusCounter type="Amount" isLoading={true} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    backgroundColor: IOColors["blueIO-50"],
    borderBottomEndRadius: 24,
    borderBottomStartRadius: 24,
    paddingVertical: 24,
    paddingTop: 500,
    marginTop: -500
  },
  initiativeName: {
    textAlign: "center"
  },
  initiativeLogo: {
    resizeMode: "cover",
    backgroundColor: IOColors.white,
    height: 56,
    width: 56,
    borderRadius: 8,
    marginBottom: 8
  },
  heroDetails: {
    flex: 2,
    alignItems: "center"
  },
  heroCounters: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  }
});

export { InitiativeCardComponent, InitiativeCardComponentSkeleton };
