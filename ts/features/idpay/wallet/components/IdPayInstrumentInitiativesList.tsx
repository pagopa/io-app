import { Badge, Divider, ListItemSwitch } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { Fragment, useCallback } from "react";

import {
  InitiativesStatusDTO,
  StatusEnum
} from "../../../../../definitions/idpay/InitiativesStatusDTO";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../store/actions";
import { idPayInitiativeFromInstrumentPotSelector } from "../store/reducers";

type Props = {
  idWallet: string;
  initiatives: ReadonlyArray<InitiativesStatusDTO>;
};

/*
 * This component is used to map a list of initiatives
 * to a list of InitiativeListItem
 */
export const IdPayInstrumentInitiativesList = ({
  initiatives,
  idWallet
}: Props) => (
  <>
    {initiatives.map((item, index) => (
      <Fragment key={item.initiativeId}>
        <IdPayInitiativeListItemSwitch idWallet={idWallet} item={item} />
        {index < initiatives.length - 1 && <Divider />}
      </Fragment>
    ))}
  </>
);

type IdPayInitiativeListItemSwitchProps = {
  idWallet: string;
  item: InitiativesStatusDTO;
};

const IdPayInitiativeListItemSwitch = ({
  item,
  idWallet
}: IdPayInitiativeListItemSwitchProps) => {
  const dispatch = useIODispatch();
  const { initiativeName, status } = item;

  const isInitiativeActive = useIOSelector(
    idPayInitiativeFromInstrumentPotSelector(item.initiativeId)
  );

  const handleSwitchValueChange = useCallback(
    (item: InitiativesStatusDTO) => {
      const { status, idInstrument, initiativeId } = item;
      const isItemActiveAndValid =
        status === StatusEnum.ACTIVE && idInstrument !== undefined;
      if (isItemActiveAndValid) {
        dispatch(
          idpayInitiativesInstrumentDelete.request({
            instrumentId: idInstrument,
            initiativeId
          })
        );
      } else {
        dispatch(
          idpayInitiativesInstrumentEnroll.request({
            idWallet,
            initiativeId
          })
        );
      }
    },
    [dispatch, idWallet]
  );

  const isActive = pot.getOrElse(isInitiativeActive, false);
  const isLoading = pot.isLoading(isInitiativeActive);

  const badge = pipe(
    O.some(status),
    O.chain(O.fromNullable),
    O.filter(
      status =>
        status === StatusEnum.PENDING_ENROLLMENT_REQUEST ||
        status === StatusEnum.PENDING_DEACTIVATION_REQUEST
    ),
    O.fold(
      () => undefined,
      () =>
        ({
          text: I18n.t(`idpay.wallet.initiativePairing.pendingStatus`),
          variant: "default"
        }) as Badge
    )
  );

  return (
    <ListItemSwitch
      badge={badge}
      isLoading={isLoading}
      label={initiativeName}
      onSwitchValueChange={() => handleSwitchValueChange(item)}
      value={isActive}
    />
  );
};
