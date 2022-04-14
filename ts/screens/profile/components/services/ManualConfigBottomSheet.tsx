import * as React from "react";
import { View } from "native-base";
import { BottomSheetContent } from "../../../../components/bottomSheet/BottomSheetContent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import {
  cancelButtonProps,
  errorButtonProps
} from "../../../../features/bonus/bonusVacanze/components/buttons/ButtonConfigurations";
import Markdown from "../../../../components/ui/Markdown";
import I18n from "../../../../i18n";
import { useIOBottomSheet } from "../../../../utils/hooks/bottomSheet";

type Props = {
  onConfirm: () => void;
  onCancel: () => void;
};

const ManualConfigConfirm = ({
  onConfirm,
  onCancel
}: Props): React.ReactElement => (
  <BottomSheetContent
    footer={
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={{
          ...cancelButtonProps(onCancel),
          onPressWithGestureHandler: true
        }}
        rightButton={{
          ...errorButtonProps(onConfirm),
          onPressWithGestureHandler: true
        }}
      />
    }
  >
    <>
      <View spacer />
      <Markdown>
        {I18n.t("services.optIn.preferences.manualConfig.bottomSheet.body")}
      </Markdown>
    </>
  </BottomSheetContent>
);

export const useManualConfigBottomSheet = (onConfirm: () => void) => {
  const {
    present,
    bottomSheet: manualConfigBottomSheet,
    dismiss
  } = useIOBottomSheet(
    <ManualConfigConfirm
      onConfirm={() => {
        onConfirm();
        dismiss();
      }}
      onCancel={() => dismiss()}
    />,
    I18n.t("services.optIn.preferences.manualConfig.bottomSheet.title"),
    350
  );

  return { present, manualConfigBottomSheet, dismiss };
};
