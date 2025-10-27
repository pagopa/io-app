import {
  Body,
  bodyFontSize,
  ContentWrapper,
  H2,
  h2FontSize,
  h3FontSize,
  h3LineHeight,
  Icon,
  IOButton,
  IOColors,
  IOSkeleton,
  IOText,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { JSX } from "react";
import { StyleSheet, View } from "react-native";
import Barcode from "react-native-barcode-builder";
import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";
import { useIOSelector } from "../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { idPayStaticCodeByInitiativeIdSelector } from "../../barcode/store/selectors";
import {
  trackIDPayStaticCodeGenerationCopy,
  trackIDPayStaticCodeGenerationError,
  trackIDPayStaticCodeGenerationSuccess
} from "../analytics";

type IDPayFailureSupportModal = {
  bottomSheet: JSX.Element;
  present: () => void;
};

export const useIDPayStaticCodeModal = (
  initiativeId: string,
  initiativeName: string
): IDPayFailureSupportModal => {
  const barcodePot = useIOSelector(idPayStaticCodeByInitiativeIdSelector)(
    initiativeId
  );

  const isLoading = pot.isLoading(barcodePot);

  const IconPlaceholder = () => (
    <>
      <VSpacer size={16} />
      <View style={{ alignItems: "center" }}>
        <Icon name="tag" size={32} />
      </View>
      <VSpacer size={16} />
    </>
  );

  const StaticCodeSkeleton = () => (
    <View>
      <IOSkeleton
        shape="rectangle"
        width="80%"
        height={h2FontSize}
        radius={4}
      />
      <VSpacer size={16} />
      <IOSkeleton
        shape="rectangle"
        width="100%"
        height={bodyFontSize}
        radius={4}
      />
      <VSpacer size={8} />
      <IOSkeleton
        shape="rectangle"
        width="75%"
        height={bodyFontSize}
        radius={4}
      />
      <VSpacer size={24} />
      <View style={styles.barcodeContainer}>
        <IconPlaceholder />
        <IOSkeleton shape="rectangle" width="100%" height={120} radius={4} />
        <VSpacer size={12} />
        <View style={{ alignItems: "center" }}>
          <IOSkeleton
            shape="rectangle"
            width="50%"
            height={h3FontSize}
            radius={4}
          />
        </View>
        <VSpacer size={32} />
      </View>
    </View>
  );

  const SuccessContent = (barcode: TransactionBarCodeResponse) => (
    <>
      <H2 weight="Semibold">
        {I18n.t(
          "idpay.initiative.beneficiaryDetails.staticCodeModal.content.title"
        )}
      </H2>
      <VSpacer size={16} />
      <Body>
        {I18n.t(
          "idpay.initiative.beneficiaryDetails.staticCodeModal.content.subtitle"
        )}
      </Body>
      <VSpacer size={24} />
      <View style={styles.barcodeContainer}>
        <IconPlaceholder />
        <Barcode format="CODE128" value={barcode.trxCode} />
        <View style={{ alignItems: "center" }}>
          <IOText
            font="FiraCode"
            size={h3FontSize}
            lineHeight={h3LineHeight}
            weight="Medium"
          >
            {barcode.trxCode}
          </IOText>
        </View>
        <VSpacer size={32} />
      </View>
    </>
  );

  const StaticCodeBottomSheetContent = () => {
    if (isLoading) {
      return <StaticCodeSkeleton />;
    }

    return pipe(
      barcodePot,
      pot.toOption,
      O.fold(
        () => {
          trackIDPayStaticCodeGenerationError({
            initiativeId,
            initiativeName
          });
          bottomSheet.dismiss();
          return <></>;
        },
        barcode => {
          trackIDPayStaticCodeGenerationSuccess({
            initiativeId,
            initiativeName
          });
          return <SuccessContent {...barcode} />;
        }
      )
    );
  };

  const FooterComponent = () =>
    pipe(
      barcodePot,
      pot.toOption,
      O.fold(
        () => null,
        barcode => (
          <ContentWrapper>
            <IOButton
              fullWidth
              variant="solid"
              label={I18n.t(
                "idpay.initiative.beneficiaryDetails.staticCodeModal.footer"
              )}
              onPress={() => {
                trackIDPayStaticCodeGenerationCopy({
                  initiativeId,
                  initiativeName
                });
                clipboardSetStringWithFeedback(barcode.trxCode);
              }}
            />
            <VSpacer size={32} />
          </ContentWrapper>
        )
      )
    );

  const bottomSheet = useIOBottomSheetModal({
    title: null,
    component: <StaticCodeBottomSheetContent />,
    footer: <FooterComponent />
  });

  return bottomSheet;
};

const styles = StyleSheet.create({
  barcodeContainer: {
    borderColor: IOColors["grey-100"],
    borderWidth: 1,
    padding: 16,
    borderRadius: 8
  }
});
