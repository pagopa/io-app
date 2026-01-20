import {
  Alert,
  Body,
  BodySmall,
  HStack,
  Icon,
  IOIcons,
  IOListItemVisualParams,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { renderActionButtons } from "../../../../../components/ui/IOScrollView";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import {
  trackItwIdMethodBottomsheet,
  trackItwIdMethodBottomsheetClose,
  trackItwIdMethodBottomsheetContinue
} from "../../analytics";
import { TrackIdMethodBottomsheetProperties } from "../../analytics/types";

type ModeType = "ciePin" | "cieId" | "spid";

const firstIconMap: Record<ModeType, IOIcons> = {
  ciePin: "fiscalCodeIndividual",
  cieId: "fiscalCodeIndividual",
  spid: "spid"
};

const secondIconMap: Record<ModeType, IOIcons> = {
  ciePin: "securityPad",
  cieId: "cie",
  spid: "fiscalCodeIndividual"
};

type Props = {
  type: "ciePin" | "cieId" | "spid";
  onPrimaryAction: () => void;
};

/**
 * Hook to display a bottom sheet with information about what you will need to continue the issuance flow
 * @param type - The type of info to display
 * @param onPrimaryAction - The action to be executed when the primary button is pressed
 * @returns The bottom sheet component
 */
export const useContinueWithBottomSheet = ({
  type,
  onPrimaryAction
}: Props) => {
  // Skip the close event when the bottom sheet is closed after the primary action
  const skipCloseEvent = useRef(false);
  const trackingProps: TrackIdMethodBottomsheetProperties = {
    ITW_ID_method: type,
    itw_flow: "L3"
  };

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.title`
    ),
    component: (
      <VStack space={24}>
        <BodySmall>
          {I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.subtitle`
          )}
        </BodySmall>
        <ListItem
          content={I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.entry-1`
          )}
          icon={firstIconMap[type]}
        />
        <ListItem
          content={I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.entry-2`
          )}
          icon={secondIconMap[type]}
        />
        {type === "spid" && (
          <Alert
            variant="warning"
            content={I18n.t(
              `features.itWallet.identification.modeSelection.mode.spid.bottomSheet.warning`
            )}
          />
        )}
        <View>
          {renderActionButtons(
            {
              type: "SingleButton",
              primary: {
                label: I18n.t(
                  `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.title`
                ),
                onPress: () => {
                  // eslint-disable-next-line functional/immutable-data
                  skipCloseEvent.current = true;
                  trackItwIdMethodBottomsheetContinue(trackingProps);
                  onPrimaryAction();
                  bottomSheet.dismiss();
                }
              }
            },
            16
          )}
        </View>
      </VStack>
    ),
    onDismiss: () => {
      if (!skipCloseEvent.current) {
        trackItwIdMethodBottomsheetClose(trackingProps);
      }
      // eslint-disable-next-line functional/immutable-data
      skipCloseEvent.current = false;
    }
  });

  return {
    ...bottomSheet,
    present: () => {
      trackItwIdMethodBottomsheet(trackingProps);
      bottomSheet.present();
    }
  };
};

const ListItem = (props: { content: string; icon: IOIcons }) => {
  const theme = useIOTheme();

  return (
    <HStack space={16} style={styles.listItem}>
      <Icon
        allowFontScaling
        name={props.icon}
        color={theme["icon-decorative"]}
        size={IOListItemVisualParams.iconSize}
      />
      <Body style={{ flex: 1, flexWrap: "wrap" }}>{props.content}</Body>
    </HStack>
  );
};

const styles = StyleSheet.create({
  listItem: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16
  }
});
