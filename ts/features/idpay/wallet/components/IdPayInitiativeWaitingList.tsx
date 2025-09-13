import { FlatList } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Badge,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { constVoid } from "fp-ts/lib/function";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { idPayInitiativeWaitingListGet } from "../store/actions";
import { idPayInitiativeWaitingListSelector } from "../store/reducers";
import { StatusEnum as InitiativeOnboardingStatus } from "../../../../../definitions/idpay/UserOnboardingStatusDTO";

export const IdPayInitiativeWaitingList = () => {
  const dispatch = useIODispatch();
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  useOnFirstRender(
    () => {
      dispatch(idPayInitiativeWaitingListGet.request());
    },
    () => isIdPayEnabled
  );

  const initiativeWaitingListPot = useIOSelector(
    idPayInitiativeWaitingListSelector
  );
  const initiativeWaitingList = pot.getOrElse(initiativeWaitingListPot, []);

  const renderListHeaderComponent = () => (
    <>
      <VSpacer size={16} />
      <ListItemHeader label="Le mie richieste" />
    </>
  );

  if (!initiativeWaitingList || initiativeWaitingList.length === 0) {
    return undefined;
  }

  return (
    <FlatList
      ListHeaderComponent={renderListHeaderComponent}
      data={initiativeWaitingList}
      ItemSeparatorComponent={() => <Divider />}
      renderItem={({ item }) => (
        <ListItemInfo
          icon="hourglass"
          topElement={{
            type: "badge",
            componentProps: getInitiativeStatusBadge(item.status)
          }}
          value={item.initiativeName}
        />
      )}
    />
  );
};

const getInitiativeStatusBadge = (
  initiativeStatus: InitiativeOnboardingStatus
): ComponentProps<typeof Badge> => {
  switch (initiativeStatus) {
    case InitiativeOnboardingStatus.ON_WAITING_LIST:
    case InitiativeOnboardingStatus.ON_EVALUATION: {
      return {
        variant: "warning",
        text: I18n.t(
          "idpay.wallet.initiativeOnboardedStatus.ON_WAITING_LIST.label"
        )
      };
    }
    default: {
      return undefined;
    }
  }
};
