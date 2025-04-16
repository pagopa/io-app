import { Body, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { useMemo } from "react";
import I18n from "../../../../../i18n.ts";
import { useIOBottomSheetAutoresizableModal } from "../../../../../utils/hooks/bottomSheet.tsx";

// Constant for bottom padding
// const NOT_TRUSTED_RP_INFO_BOTTOM_PADDING = 180;

/**
 * Content component for the Not Trusted RP bottom sheet
 */
export const ItwRemoteNotTrustedRPBottomSheetContent = () =>
  useMemo(
    () => (
      <View>
        <Body>
          {I18n.t(
            "features.itWallet.presentation.remote.RPNotTrustedScreen.bottomSheet.contentTop"
          )}
        </Body>
        <VSpacer size={16} />
        <View>
          <ListItemHeader
            label={I18n.t(
              "features.itWallet.presentation.remote.RPNotTrustedScreen.bottomSheet.subtitle"
            )}
          />
          <Body>
            {I18n.t(
              "features.itWallet.presentation.remote.RPNotTrustedScreen.bottomSheet.contentBottom"
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
  useIOBottomSheetAutoresizableModal(
    {
      title: I18n.t(
        "features.itWallet.presentation.remote.RPNotTrustedScreen.bottomSheet.title"
      ),
      component: <ItwRemoteNotTrustedRPBottomSheetContent />
      // TODO: [SIW-2266] Uncomment when the FAQ are ready and use NOT_TRUSTED_RP_INFO_BOTTOM_PADDING instead of 100
      /*     footer: (
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            onPress: () => {},
            label: I18n.t(
              "features.itWallet.presentation.remote.RPNotTrustedScreen.bottomSheet.primaryAction"
            )
          }
        }}
      />
    ) */
    },
    100
  );
