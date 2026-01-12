import {
  Alert,
  IOIcons,
  ListItemHeader,
  makeFontStyleObject,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Text, View } from "react-native";
import { renderActionButtons } from "../../../../../components/ui/IOScrollView";
import { useIOSelector } from "../../../../../store/hooks";
import { fontPreferenceSelector } from "../../../../../store/reducers/persistedPreferences";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";

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
  const typefacePreference = useIOSelector(fontPreferenceSelector);

  const bottomSheet = useIOBottomSheetModal({
    title: I18n.t(
      `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.title`
    ),
    component: (
      <VStack space={24}>
        <Text
          allowFontScaling={false}
          style={{
            ...makeFontStyleObject(
              16,
              typefacePreference === "comfortable"
                ? "Titillio"
                : "TitilliumSansPro",
              24,
              "Regular"
            )
          }}
        >
          {I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.subtitle`
          )}
        </Text>
        <ListItemHeader
          label={I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.entry-1`
          )}
          iconName={firstIconMap[type]}
        />
        <ListItemHeader
          label={I18n.t(
            `features.itWallet.identification.modeSelection.mode.${type}.bottomSheet.entry-2`
          )}
          iconName={secondIconMap[type]}
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
                  onPrimaryAction();
                  bottomSheet.dismiss();
                }
              }
            },
            16
          )}
        </View>
      </VStack>
    )
  });

  return {
    ...bottomSheet,
    // When opening the bottom sheet, track the view event by default.
    // Pass { skipTracking: true } to skip sending the analytics event.
    present: (options?: { skipTracking: boolean }) => {
      if (!options?.skipTracking) {
        // TODO: [SIW-3546] add tracking
      }
      bottomSheet.present();
    }
  };
};
