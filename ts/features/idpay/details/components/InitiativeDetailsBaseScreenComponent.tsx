import { ButtonSolidProps, VSpacer } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { StyleSheet } from "react-native";
import { InitiativeDTO } from "../../../../../definitions/idpay/InitiativeDTO";
import { BonusCardScreenComponent } from "../../../../components/BonusCard";
import { BonusCardCounter } from "../../../../components/BonusCard/BonusCardCounter";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";

type BaseProps = {
  footer?: ButtonSolidProps;
  onHeaderDetailsPress: () => void;
};

type Props =
  | { isLoading: true }
  | ({ isLoading?: false } & {
      initiative: InitiativeDTO;
      counters: ReadonlyArray<BonusCardCounter>;
    });

const InitiativeDetailsBaseScreenComponent = (
  props: React.PropsWithChildren<BaseProps & Props>
) => {
  if (props.isLoading) {
    return <BonusCardScreenComponent isLoading={true} />;
  }

  const { lastCounterUpdate, initiativeName, organizationName, endDate } =
    props.initiative;

  const lastUpdateComponent = pipe(
    lastCounterUpdate,
    O.fromNullable,
    O.map(date => format(date, "DD/MM/YYYY, HH:mm")),
    O.fold(
      () => undefined,
      lastUpdated => (
        <LabelSmall
          style={styles.lastUpdate}
          color="bluegrey"
          weight="Regular"
          testID={"IDPayDetailsLastUpdatedTestID"}
        >
          {I18n.t(
            "idpay.initiative.details.initiativeDetailsScreen.configured.lastUpdated"
          )}
          {lastUpdated}
        </LabelSmall>
      )
    )
  );

  return (
    <BonusCardScreenComponent
      headerAction={{
        icon: "info",
        onPress: props.onHeaderDetailsPress,
        accessibilityLabel: "info"
      }}
      name={initiativeName || ""}
      organizationName={organizationName || ""}
      endDate={endDate}
      status={"ACTIVE"}
      contextualHelp={emptyContextualHelp}
      counters={props.counters}
      footerCta={props.footer}
    >
      {lastUpdateComponent}
      <VSpacer size={8} />
      {props.children}
    </BonusCardScreenComponent>
  );
};

const styles = StyleSheet.create({
  lastUpdate: {
    alignSelf: "center",
    alignItems: "center",
    padding: 16
  }
});

export default InitiativeDetailsBaseScreenComponent;
