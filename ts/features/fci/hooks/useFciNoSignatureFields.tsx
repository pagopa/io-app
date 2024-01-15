import * as React from "react";
import { StyleSheet, View } from "react-native";
import { StackActions, useNavigation } from "@react-navigation/native";
import { increment } from "fp-ts/lib/function";
import { useLegacyIOBottomSheetModal } from "../../../utils/hooks/bottomSheet";
import { IOStyles } from "../../../components/core/variables/IOStyles";
import { H3 } from "../../../components/core/typography/H3";
import FooterWithButtons from "../../../components/ui/FooterWithButtons";
import I18n from "../../../i18n";
import customVariables from "../../../theme/variables";
import { confirmButtonProps } from "../../../components/buttons/ButtonConfigurations";
import { H4 } from "../../../components/core/typography/H4";
import { FCI_ROUTES } from "../navigation/routes";
import { fciSignatureDetailDocumentsSelector } from "../store/reducers/fciSignatureRequest";
import { useIOSelector } from "../../../store/hooks";
import { trackFciStartSignature } from "../analytics";
import { fciEnvironmentSelector } from "../store/reducers/fciEnvironment";

type Props = {
  currentDoc: number;
};

const styles = StyleSheet.create({
  verticalPad: {
    paddingVertical: customVariables.spacerHeight
  }
});

/**
 * A hook that returns a function to present the abort signature flow bottom sheet
 */
export const useFciNoSignatureFields = (props: Props) => {
  const navigation = useNavigation();
  const documents = useIOSelector(fciSignatureDetailDocumentsSelector);
  const fciEnvironment = useIOSelector(fciEnvironmentSelector);
  const { currentDoc } = props;
  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <View style={styles.verticalPad}>
      <H4 weight={"Regular"}>{I18n.t("features.fci.noFields.content")}</H4>
    </View>,
    <View style={IOStyles.flex}>
      <H3 color={"bluegreyDark"} weight={"SemiBold"}>
        {I18n.t("features.fci.noFields.title")}
      </H3>
    </View>,
    280,
    <FooterWithButtons
      type={"TwoButtonsInlineThird"}
      leftButton={{
        onPressWithGestureHandler: true,
        bordered: true,
        onPress: () => {
          dismiss();
        },
        title: I18n.t("features.fci.noFields.leftButton")
      }}
      rightButton={{
        ...confirmButtonProps(() => {
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
        }, I18n.t("features.fci.noFields.rightButton")),
        onPressWithGestureHandler: true
      }}
    />
  );

  return {
    dismiss,
    present,
    bottomSheet
  };
};
