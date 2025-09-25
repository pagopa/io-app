import { ContentWrapper, VSpacer } from "@pagopa/io-app-design-system";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useMemo } from "react";
import { Image } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../../components/ui/IOScrollViewWithLargeHeader";

export type CiePreparationTypeAlt = "card" | "can";

type Props = { type: CiePreparationTypeAlt };

export const ItwCiePreparationScreenContentAlt = ({ type }: Props) => {
  const imageSrc = useMemo(() => {
    switch (type) {
      case "card":
        return require("../../../../../../img/features/itWallet/identification/cie_card.png");
      case "can":
        return require("../../../../../../img/features/itWallet/identification/cie_can.png");
      default:
        return undefined;
    }
  }, [type]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t(
          `features.itWallet.identification.cie.prepare.${type}.title`
        )
      }}
      description={I18n.t(
        `features.itWallet.identification.cie.prepare.${type}.content`
      )}
      headerActionsProp={{ showHelp: true }}
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t(`features.itWallet.identification.cie.prepare.can.cta`),
          onPress: constNull // TODO [SIW-3045] continue with L2+ authentication
        }
      }}
    >
      <ContentWrapper>
        <VSpacer size={8} />
        <Image
          accessibilityIgnoresInvertColors
          source={imageSrc}
          resizeMode="contain"
          style={{ width: "100%" }}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};
