import { Body, FooterActionsInline } from "@pagopa/io-app-design-system";
import { StackActions } from "@react-navigation/native";
import { increment } from "fp-ts/lib/function";
import { ComponentProps } from "react";
import I18n from "i18next";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import { useIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { trackFciStartSignature } from "../analytics";
import { FCI_ROUTES } from "../navigation/routes";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";

type Props = {
  currentDoc: number;
};

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciNoSignatureFields = (props: Props) => {
  const navigation = useIONavigation();
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const { currentDoc } = props;

  const readButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["startAction"] = {
    color: "primary",
    onPress: () => {
      dismiss();
    },
    label: I18n.t("features.fci.noFields.leftButton")
  };

  const confirmButtonProps: ComponentProps<
    typeof FooterActionsInline
  >["endAction"] = {
    color: "primary",
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
        trackFciStartSignature(fciEnvironment);
        navigation.navigate(FCI_ROUTES.MAIN, {
          screen: FCI_ROUTES.USER_DATA_SHARE
        });
      }
    },
    label: I18n.t("features.fci.noFields.rightButton")
  };

  const { present, bottomSheet, dismiss } = useIOBottomSheetModal({
    component: (
      <Body weight={"Regular"}>{I18n.t("features.fci.noFields.content")}</Body>
    ),
    title: I18n.t("features.fci.noFields.title"),
    snapPoint: [280],
    footer: (
      <FooterActionsInline
        startAction={readButtonProps}
        endAction={confirmButtonProps}
      />
    )
  });

  return {
    dismiss,
    present,
    bottomSheet
  };
};
