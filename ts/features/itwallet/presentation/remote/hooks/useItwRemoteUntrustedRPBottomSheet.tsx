import { Body, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { memo } from "react";
import I18n from "../../../../../i18n.ts";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet.tsx";

/**
 * Content component for the Not Trusted RP bottom sheet
 */
const ItwRemoteUntrustedRPBottomSheetContent = memo(() => (
  <View>
    <Body>
      {I18n.t(
        "features.itWallet.presentation.remote.untrustedRpScreen.bottomSheet.contentTop"
      )}
    </Body>
    <VSpacer size={16} />
    <View>
      <ListItemHeader
        label={I18n.t(
          "features.itWallet.presentation.remote.untrustedRpScreen.bottomSheet.subtitle"
        )}
      />
      <Body>
        {I18n.t(
          "features.itWallet.presentation.remote.untrustedRpScreen.bottomSheet.contentBottom"
        )}
      </Body>
    </View>
  </View>
));

/**
 * Hook to create the  Untrusted RP bottom sheet
 * @returns Bottom sheet modal object
 */
export const useItwRemoteUntrustedRPBottomSheet = () =>
  useIOBottomSheetModal({
    title: I18n.t(
      "features.itWallet.presentation.remote.untrustedRpScreen.bottomSheet.title"
    ),
    component: <ItwRemoteUntrustedRPBottomSheetContent />,
    snapPoint: [300]
    // TODO: [SIW-2266] Uncomment when the FAQ are ready
    /*     footer: (
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            onPress: () => {},
            label: I18n.t(
              "features.itWallet.presentation.remote.untrustedRpScreen.bottomSheet.primaryAction"
            )
          }
        }}
      />
    ) */
  });
