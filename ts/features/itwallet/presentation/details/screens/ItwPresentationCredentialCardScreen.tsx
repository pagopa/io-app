import {
  HeaderSecondLevel,
  IOColors,
  useIOTheme
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IOStackNavigationRouteProps } from "../../../../../navigation/params/AppParamsList.ts";
import { useIOSelector } from "../../../../../store/hooks.ts";
import { usePreventScreenCapture } from "../../../../../utils/hooks/usePreventScreenCapture.ts";
import { itwCredentialSelector } from "../../../credentials/store/selectors";
import { ItwParamsList } from "../../../navigation/ItwParamsList.ts";
import { ItwPresentationCredentialCard } from "../components/ItwPresentationCredentialCard.tsx";

export type ItwPresentationCredentialCardScreenNavigationParams = {
  credentialType: string;
};

type Props = IOStackNavigationRouteProps<
  ItwParamsList,
  "ITW_PRESENTATION_CREDENTIAL_CARD_SCREEN"
>;

const ItwPresentationCredentialCardScreen = ({ route, navigation }: Props) => {
  const { credentialType } = route.params;
  const credentialOption = useIOSelector(itwCredentialSelector(credentialType));
  const theme = useIOTheme();
  const safeAreaInsets = useSafeAreaInsets();

  usePreventScreenCapture();

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <HeaderSecondLevel
          title=""
          type="singleAction"
          firstAction={{
            icon: "closeLarge",
            accessibilityLabel: I18n.t("global.buttons.close"),
            onPress: () => navigation.goBack()
          }}
        />
      )
    });
  }, [navigation]);

  return pipe(
    credentialOption,
    O.fold(constNull, credential => (
      <View
        style={[
          styles.container,
          {
            paddingBottom: safeAreaInsets.bottom,
            backgroundColor: IOColors[theme["appBackground-primary"]]
          }
        ]}
      >
        <ItwPresentationCredentialCard credential={credential} />
      </View>
    ))
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start"
  }
});

export { ItwPresentationCredentialCardScreen };
