import { useMemo } from "react";
import {
  ContentWrapper,
  ListItemHeader,
  ModuleNavigation,
  VStack
} from "@pagopa/io-app-design-system";
import { useIOSelector } from "../../../../store/hooks.ts";
import { itwDisabledIdentificationMethodsSelector } from "../../common/store/selectors/remoteConfig.ts";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import I18n from "../../../../i18n.ts";

type L2IdentificationViewProps = {
  onSpidPress: () => void;
  onCieIdPress: () => void;
};

export const L2IdentificationView = ({
  onSpidPress,
  onCieIdPress
}: L2IdentificationViewProps) => {
  const disabledIdentificationMethods = useIOSelector(
    itwDisabledIdentificationMethodsSelector
  );

  const isSpidDisabled = useMemo(
    () => disabledIdentificationMethods.includes("SPID"),
    [disabledIdentificationMethods]
  );
  const isCieIdDisabled = useMemo(
    () => disabledIdentificationMethods.includes("CieID"),
    [disabledIdentificationMethods]
  );

  return (
    <IOScrollViewWithLargeHeader
      title={{ label: I18n.t("features.itWallet.identification.mode.title") }}
      description={I18n.t("features.itWallet.identification.mode.description")}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        <ListItemHeader
          label={I18n.t("features.itWallet.identification.mode.header")}
        />
        <VStack space={8}>
          {!isSpidDisabled && (
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.identification.mode.method.spid.title"
              )}
              subtitle={I18n.t(
                "features.itWallet.identification.mode.method.spid.subtitle"
              )}
              testID="Spid"
              icon="spid"
              onPress={onSpidPress}
            />
          )}
          {!isCieIdDisabled && (
            <ModuleNavigation
              title={I18n.t(
                "features.itWallet.identification.mode.method.cieId.title"
              )}
              subtitle={I18n.t(
                "features.itWallet.identification.mode.method.cieId.subtitle"
              )}
              icon="device"
              testID="CieID"
              onPress={onCieIdPress}
            />
          )}
        </VStack>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
