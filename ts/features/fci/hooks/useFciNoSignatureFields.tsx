import * as React from "react";
import { StackActions, useNavigation } from "@react-navigation/native";
import { increment } from "fp-ts/lib/function";
import {
  Body,
  ButtonSolidProps,
  FooterWithButtons
} from "@pagopa/io-app-design-system";
import I18n from "../../../i18n";
import { FCI_ROUTES } from "../navigation/routes";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import { useIOSelector } from "../../../store/hooks";
import { trackFciStartSignature } from "../analytics";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";

type Props = {
  currentDoc: number;
};

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciNoSignatureFields = (props: Props) => {
  const navigation = useNavigation();
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const { currentDoc } = props;
  const readButtonProps: ButtonSolidProps = {
    onPress: () => {
      dismiss();
    },
    label: I18n.t("features.fci.noFields.leftButton"),
    accessibilityLabel: I18n.t("features.fci.noFields.leftButton")
  };
  const confirmButtonProps: ButtonSolidProps = {
    onPress: () => {
      dismiss();
      if (currentDoc < documents.length - 1) {
        navigation.dispatch(
          StackActions.push(FCI_ROUTES.DOCUMENTS, {
            attrs: undefined,
            currentDoc: increment(currentDoc)
          })
        );
      } else {
        trackFciStartSignature();
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.USER_DATA_SHARE
        });
      }
    },
    label: I18n.t("features.fci.noFields.rightButton"),
    accessibilityLabel: I18n.t("features.fci.noFields.rightButton")
  };
  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    component: (
      <Body weight={"Regular"}>{I18n.t("features.fci.noFields.content")}</Body>
    ),
    title: I18n.t("features.fci.noFields.title"),
    snapPoint: [280],
    footer: (
      <FooterWithButtons
        type={"TwoButtonsInlineThird"}
        primary={{
          type: "Outline",
          buttonProps: readButtonProps
        }}
        secondary={{
          type: "Solid",
          buttonProps: confirmButtonProps
        }}
      />
    )
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
