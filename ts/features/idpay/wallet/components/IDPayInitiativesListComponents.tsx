import {
  Badge,
  Divider,
  IOSpacingScale,
  IOStyles
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  InitiativesStatusDTO,
  StatusEnum
} from "../../../../../definitions/idpay/InitiativesStatusDTO";
import { RemoteSwitch } from "../../../../components/core/selection/RemoteSwitch";
import I18n from "../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../store/actions";
import { idPayInitiativeFromInstrumentPotSelector } from "../store/reducers";
import { NewH6 } from "../../../../components/core/typography/NewH6";

const itemContainerVerticalSpacing: IOSpacingScale = 16;

const styles = StyleSheet.create({
  listItemContainer: {
    ...IOStyles.row,
    paddingVertical: itemContainerVerticalSpacing
  },
  leftContent: {
    ...IOStyles.flex,
    paddingRight: 8
  }
});

type InitiativeListProps = {
  initiatives: ReadonlyArray<InitiativesStatusDTO>;
  idWallet: string;
};
/*
 * This component is used to map a list of initiatives
 * to a list of InitiativeListItem
 */
export const IDPayInitiativesList = ({
  initiatives,
  idWallet
}: InitiativeListProps) => (
  <>
    {initiatives.map((item, index) => (
      <IDPayInitiativeListItem
        item={item}
        key={item.initiativeId}
        idWallet={idWallet}
        isLast={index === initiatives.length - 1}
      />
    ))}
  </>
);

type ListItemProps = {
  item: InitiativesStatusDTO;
  idWallet: string;
  isLast: boolean;
};

export const IDPayInitiativeListItem = ({
  item,
  idWallet,
  isLast
}: ListItemProps) => {
  const { initiativeName } = item;

  return (
    <View>
      <View style={styles.listItemContainer}>
        <View style={styles.leftContent}>
          <NewH6 numberOfLines={1}>{initiativeName}</NewH6>
        </View>
        <SwitchOrStatusLabel item={item} idWallet={idWallet} />
      </View>
      {!isLast && <Divider />}
    </View>
  );
};

type SwitchOrStatusLabelProps = {
  item: InitiativesStatusDTO;
  idWallet: string;
};
const SwitchOrStatusLabel = ({ item, idWallet }: SwitchOrStatusLabelProps) => {
  const { updateInitiativeStatus } = useInitiativeStatusUpdate(item, idWallet);
  const { status } = item;
  const switchValue = useIOSelector(state =>
    idPayInitiativeFromInstrumentPotSelector(state, item.initiativeId)
  );
  switch (status) {
    case StatusEnum.ACTIVE:
    case StatusEnum.INACTIVE:
      return (
        // we are passing status here because we are sure it is either ACTIVE or INACTIVE
        <RemoteSwitch
          onValueChange={() => updateInitiativeStatus(status)}
          value={switchValue}
        />
      );
    case StatusEnum.PENDING_ENROLLMENT_REQUEST:
    case StatusEnum.PENDING_DEACTIVATION_REQUEST:
      return (
        <Badge
          text={I18n.t(`idpay.wallet.initiativePairing.statusLabels.${status}`)}
          variant="warning"
        />
      );
    default:
      return null;
  }
};

const useInitiativeStatusUpdate = (
  item: InitiativesStatusDTO,
  idWallet: string
) => {
  const dispatch = useIODispatch();
  const { idInstrument, initiativeId } = item;
  type ValidStatus = typeof StatusEnum.ACTIVE | typeof StatusEnum.INACTIVE;
  const updateInitiativeStatus = (status: ValidStatus) => {
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
  };

  return { updateInitiativeStatus };
};
