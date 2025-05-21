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
import { CieWarningType } from "../screens/ItwIdentificationCieWarningScreen.tsx";
import { ItwEidIssuanceMachineContext } from "../../machine/provider.tsx";
import {useNoCieBottomSheet} from "../hooks/useNoCieBottomSheet.tsx";

type L3IdentificationViewProps = {
  handleCiePinPress: () => void;
  handleCieIdPress: () => void;
};

export const L3IdentificationView = ({
  handleCiePinPress,
  handleCieIdPress
}: L3IdentificationViewProps) => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();

  const navigateToCieWarning = (warning: CieWarningType) => {
    machineRef.send({ type: "go-to-cie-warning", warning });
  };

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

  const cieInfoBottomSheet = useItwIdentificationBottomSheet({
    title: I18n.t(
      "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.title"
    ),
    content: [
      {
        body: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.content"
        )
      }
    ],
    imageSrc: require("../../../../../img/features/itWallet/identification/itw_cie_placeholder.png"),
    footerButtons: [
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.primaryAction"
        ),
        onPress: () => {
          cieInfoBottomSheet.dismiss();
        }
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.cieInfo.secondaryAction"
        ),
        onPress: () => {
          navigateToCieWarning("noCie");
          cieInfoBottomSheet.dismiss();
        }
      }
    ]
  });

  const pinBottomSheet = useItwIdentificationBottomSheet({
    title: I18n.t(
      "features.itWallet.identification.l3.mode.bottomSheet.pin.title"
    ),
    content: [
      {
        body: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.content"
        )
      }
    ],
    // TODO: replace with the correct image when available
    imageSrc: require("../../../../../img/features/itWallet/identification/itw_cie_pin_placeholder.png"),
    footerButtons: [
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.primaryAction"
        ),
        onPress: () => {
          pinBottomSheet.dismiss();
        }
      },
      {
        label: I18n.t(
          "features.itWallet.identification.l3.mode.bottomSheet.pin.secondaryAction"
        ),
        onPress: () => {
          navigateToCieWarning("noPin");
          pinBottomSheet.dismiss();
        }
      }
    ]
  });

  const { noCieBottomSheet } = useNoCieBottomSheet();

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
        type: "TwoButtons",
        primary: {
          label: I18n.t("features.itWallet.identification.l3.mode.primaryAction"),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.l3.mode.primaryAction"
          ),
          onPress: handleCiePinPress,
          testID: "l3-primary-action"
        },
        secondary: {
          label: I18n.t("features.itWallet.identification.l3.mode.secondaryAction"),
          accessibilityLabel: I18n.t(
            "features.itWallet.identification.l3.mode.secondaryAction"
          ),
          onPress: noCieBottomSheet.present,
          testID: "l3-secondary-action"
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
        {noCieBottomSheet.bottomSheet}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};


