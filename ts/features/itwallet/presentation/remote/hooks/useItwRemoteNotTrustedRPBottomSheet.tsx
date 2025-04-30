import { Body, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useMemo } from "react";
import I18n from "../../../../../i18n.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";

/**
 * Content component for the Not Trusted RP bottom sheet
 */
export const ItwRemoteNotTrustedRPBottomSheetContent = () =>
  useMemo(
    () => (
      <View>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.remote.NotTrustedRPScreen.bottomSheet.contentTop"
          )}
        </Body>
        <VSpacer size={16} />
        <View>
          <ListItemHeader
            label={I18n.t(
              "features.itWallet.presentation.remote.NotTrustedRPScreen.bottomSheet.subtitle"
            )}
          />
          <Body>
            {I18n.t(
              "features.itWallet.presentation.remote.NotTrustedRPScreen.bottomSheet.contentBottom"
            )}
          </Body>
        </View>
      </View>
    ),
    []
  );

/**
 * Hook to create the Not Trusted RP bottom sheet
 * @returns Bottom sheet modal object
 */
export const useItwRemoteNotTrustedRPBottomSheet = () =>
  useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.remote.NotTrustedRPScreen.bottomSheet.title"
    ),
    component: <ItwRemoteNotTrustedRPBottomSheetContent />,
    snapPoint: [300]
    // TODO: [SIW-2266] Uncomment when the FAQ are ready
    /*     footer: (
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            onPress: () => {},
            label: I18n.t(
              "features.itWallet.presentation.remote.NotTrustedRPScreen.bottomSheet.primaryAction"
            )
          }
        }}
      />
    ) */
  });
