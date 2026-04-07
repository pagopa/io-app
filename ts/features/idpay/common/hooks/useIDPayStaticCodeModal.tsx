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
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { JSX } from "react";
import { StyleSheet, View } from "react-native";
import Barcode from "react-native-barcode-builder";

import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "../../../../../definitions/idpay/TransactionErrorDTO";
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

type Props = {
  initiativeId: string;
  initiativeName: string;
  onDismiss: () => void;
};

export const useIDPayStaticCodeModal = (
  props: Props
): IDPayFailureSupportModal => {
  const { initiativeId, initiativeName, onDismiss } = props;

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
    <View testID="idpay-static-code-skeleton">
      <IOSkeleton
        height={h2FontSize}
        radius={4}
        shape="rectangle"
        width="80%"
      />
      <VSpacer size={16} />
      <IOSkeleton
        height={bodyFontSize}
        radius={4}
        shape="rectangle"
        width="100%"
      />
      <VSpacer size={8} />
      <IOSkeleton
        height={bodyFontSize}
        radius={4}
        shape="rectangle"
        width="75%"
      />
      <VSpacer size={24} />
      <View style={styles.barcodeContainer}>
        <IconPlaceholder />
        <IOSkeleton height={120} radius={4} shape="rectangle" width="100%" />
        <VSpacer size={12} />
        <View style={{ alignItems: "center" }}>
          <IOSkeleton
            height={h3FontSize}
            radius={4}
            shape="rectangle"
            width="50%"
          />
        </View>
      </View>
    </View>
  );

  const SuccessContent = (barcode: TransactionBarCodeResponse) => {
    const theme = useIOTheme();

    return (
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
              color={theme["textBody-default"]}
              font="FiraCode"
              lineHeight={h3LineHeight}
              size={h3FontSize}
              weight="Medium"
            >
              {barcode.trxCode}
            </IOText>
          </View>
          <VSpacer size={32} />
        </View>
        <VSpacer size={32} />
        <VSpacer size={32} />
      </>
    );
  };

  const StaticCodeBottomSheetContent = () => {
    if (isLoading) {
      return <StaticCodeSkeleton />;
    }

    const decodeFailure = flow(TransactionErrorDTO.decode, O.fromEither);

    return pipe(
      barcodePot,
      pot.toOption,
      O.fold(
        () => {
          if (pot.isError(barcodePot)) {
            const reason = pipe(
              decodeFailure(barcodePot.error),
              O.fold(
                () => undefined,
                failure => failure.code
              )
            );

            const technicalMessage = pipe(
              decodeFailure(barcodePot.error),
              O.fold(
                () => undefined,
                failure => failure.message
              )
            );

            trackIDPayStaticCodeGenerationError({
              initiativeId,
              initiativeName,
              reason,
              technicalMessage
            });
          }
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
              variant="solid"
            />
            <VSpacer size={32} />
          </ContentWrapper>
        )
      )
    );

  const bottomSheet = useIOBottomSheetModal({
    title: null,
    component: <StaticCodeBottomSheetContent />,
    footer: <FooterComponent />,
    onDismiss
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
