import {
  ContentWrapper,
  Divider,
  ListItemHeader,
  ListItemInfo,
  ListItemNav,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useItwIdentificationBottomSheet } from "../../common/hooks/useItwIdentificationBottomSheet.tsx";
import I18n from "../../../../i18n.ts";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import { useCieInfoBottomSheet } from "../hooks/useCieInfoBottomSheet.tsx";
import { usePinBottomSheet } from "../hooks/usePinBottomSheet.tsx";

type L3IdentificationViewProps = {
  handleCiePinPress: () => void;
  handleCieIdPress: () => void;
};

export const L3IdentificationView = ({
  handleCiePinPress,
  handleCieIdPress
}: L3IdentificationViewProps) => {
  const cieBottomSheet = useItwIdentificationBottomSheet({
    title: I18n.t(
      "features.itWallet.identification.l3.mode.bottomSheet.cie.title"
    ),
    content: [
      {
        body: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cie.content"
        )
      }
    ],
    footerButtons: [
      {
        icon: "cie",
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cie.action"
        ),
        onPress: () => {
          handleCieIdPress();
          cieBottomSheet.dismiss();
        }
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cie.cancel"
        ),
        onPress: () => {
          cieBottomSheet.dismiss();
        }
      }
    ]
  });

  const cieInfoBottomSheet = useCieInfoBottomSheet({
    onPrimaryAction: () => {
      cieBottomSheet.dismiss();
    },
    onSecondaryAction: () => {
      cieBottomSheet.dismiss();
    }
  });
  const pinBottomSheet = usePinBottomSheet({
    onPrimaryAction: () => {
      cieBottomSheet.dismiss();
    },
    onSecondaryAction: () => {
      cieBottomSheet.dismiss();
    }
  });

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.itWallet.identification.l3.mode.title")
      }}
      description={I18n.t(
        "features.itWallet.identification.l3.mode.description"
      )}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("features.itWallet.identification.l3.mode.action"),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.l3.mode.action"
          ),
          onPress: handleCiePinPress,
          testID: "l3-primary-action"
        }
      }}
      testID="l3-identification-view"
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.identification.l3.mode.ciePin.header"
          )}
          testID="l3-cie-pin-header"
        />
        <VStack space={8}>
          <ListItemInfo
            value={I18n.t(
              "features.itWallet.identification.l3.mode.ciePin.card"
            )}
            icon={"fiscalCodeIndividual"}
            testID="l3-cie-card-info"
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: () => cieInfoBottomSheet.present(),
                accessibilityLabel: I18n.t("global.buttons.info"),
                testID: "l3-cie-info-button"
              }
            }}
          />
          <Divider />
          <ListItemInfo
            value={I18n.t(
              "features.itWallet.identification.l3.mode.ciePin.pin"
            )}
            icon={"key"}
            testID="l3-pin-info"
            endElement={{
              type: "iconButton",
              componentProps: {
                icon: "info",
                onPress: () => pinBottomSheet.present(),
                accessibilityLabel: I18n.t("global.buttons.info"),
                testID: "l3-pin-info-button"
              }
            }}
          />
        </VStack>
        <VSpacer size={24} />
        <ListItemHeader
          label={I18n.t(
            "features.itWallet.identification.l3.mode.cieId.header"
          )}
          testID="l3-cie-id-header"
        />
        <ListItemNav
          icon={"cie"}
          value={I18n.t("features.itWallet.identification.l3.mode.cieId.title")}
          description={I18n.t(
            "features.itWallet.identification.l3.mode.cieId.subtitle"
          )}
          onPress={cieBottomSheet.present}
          testID="l3-cie-id-nav"
        />
        {cieBottomSheet.bottomSheet}
        {cieInfoBottomSheet.bottomSheet}
        {pinBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
