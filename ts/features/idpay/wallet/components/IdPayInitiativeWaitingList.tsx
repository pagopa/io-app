import { FlatList } from "react-native";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  Divider,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useState } from "react";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { idPayInitiativeWaitingListGet } from "../store/actions";
import { idPayInitiativeWaitingListSelector } from "../store/reducers";
import {
  StatusEnum as InitiativeOnboardingStatus,
  UserOnboardingStatusDTO
} from "../../../../../definitions/idpay/UserOnboardingStatusDTO";
import IOMarkdown from "../../../../components/IOMarkdown";
import { isAndroid } from "../../../../utils/platform";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { trackIDPayOnWaitingListInfoButtonTap } from "../analytics";

export const IdPayInitiativeWaitingList = () => {
  const dispatch = useIODispatch();
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);
  const [selectedInitiative, setSelectedInitiative] = useState<
    UserOnboardingStatusDTO | undefined
  >();

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <>
        <IOMarkdown
          content={I18n.t(
            "idpay.wallet.initiativeOnboardedStatus.ON_WAITING_LIST.bottomSheet.content",
            {
              initiativeName: selectedInitiative?.initiativeName
            }
          )}
        />
        {isAndroid && <VSpacer size={24} />}
      </>
    ),
    title: I18n.t(
      "idpay.wallet.initiativeOnboardedStatus.ON_WAITING_LIST.bottomSheet.title"
    )
  });

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
      <ListItemHeader
        label={I18n.t("idpay.wallet.initiativeOnboardedStatus.header")}
      />
    </>
  );

  if (!initiativeWaitingList || initiativeWaitingList.length === 0) {
    return undefined;
  }

  const handleOpenWaitingListBottomSheet = (item: UserOnboardingStatusDTO) => {
    setSelectedInitiative(item);
    trackIDPayOnWaitingListInfoButtonTap({
      initiativeId: item.initiativeId
    });
    present();
  };

  return (
    <>
      <FlatList
        ListHeaderComponent={renderListHeaderComponent}
        data={initiativeWaitingList}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <ListItemInfo
            icon="hourglass"
            topElement={getInitiativeStatusBadge(item.status)}
            value={item.initiativeName}
            endElement={
              item.status !== InitiativeOnboardingStatus.ON_WAITING_LIST
                ? undefined
                : {
                    type: "iconButton",
                    componentProps: {
                      icon: "info",
                      color: "primary",
                      accessibilityLabel: I18n.t(
                        "idpay.wallet.initiativeOnboardedStatus.ON_WAITING_LIST.accessibilityInfoLabel"
                      ),
                      onPress: () => handleOpenWaitingListBottomSheet(item)
                    }
                  }
            }
          />
        )}
      />
      {bottomSheet}
    </>
  );
};

const getInitiativeStatusBadge = (
  initiativeStatus: InitiativeOnboardingStatus
): ListItemInfo["topElement"] | undefined => {
  switch (initiativeStatus) {
    case InitiativeOnboardingStatus.ON_WAITING_LIST:
      return {
        type: "badge",
        componentProps: {
          variant: "default",
          text: I18n.t(
            "idpay.wallet.initiativeOnboardedStatus.ON_WAITING_LIST.label"
          )
        }
      };
    case InitiativeOnboardingStatus.ON_EVALUATION: {
      return {
        type: "badge",
        componentProps: {
          variant: "warning",
          text: I18n.t(
            "idpay.wallet.initiativeOnboardedStatus.ON_EVALUATION.label"
          )
        }
      };
    }
    default: {
      return undefined;
    }
  }
};
