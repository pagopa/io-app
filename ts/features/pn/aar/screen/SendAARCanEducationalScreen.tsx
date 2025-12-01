import { SafeAreaView } from "react-native-safe-area-context";
import { constNull } from "fp-ts/lib/function";
import { IOVisualCostants, VSpacer } from "@pagopa/io-app-design-system";
import { Alert, Dimensions, Image } from "react-native";
import i18n from "i18next";
import cieCanEducationalSource from "../../../../../img/features/pn/cieCanEducational.png";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useSendAarFlowManager } from "../hooks/useSendAarFlowManager";

const screenWidth = Dimensions.get("screen").width;
const { width, height, uri } = Image.resolveAssetSource(
  cieCanEducationalSource
);
const aspectRatio = width / height;
const maxScreenWidth = screenWidth - IOVisualCostants.appMarginDefault * 2;
const maxHeight = maxScreenWidth / aspectRatio;

export const SendAARCanEducationalScreen = () => {
  const { terminateFlow } = useSendAarFlowManager();

  const handleGoBack = () => {
    Alert.alert(
      i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.title"),
      i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.message"),
      [
        {
          text: i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.confirm"),
          style: "destructive",
          onPress: terminateFlow
        },
        {
          text: i18n.t("features.pn.aar.flow.cieCanAdvisory.alert.cancel")
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <IOScrollViewWithLargeHeader
        actions={{
          type: "SingleButton",
          primary: {
            label: i18n.t("global.buttons.continue"),
            onPress: constNull
          }
        }}
        title={{
          label: i18n.t("features.pn.aar.flow.cieCanAdvisory.title", {
            denomination: "Mario Rossi"
          })
        }}
        description={i18n.t("features.pn.aar.flow.cieCanAdvisory.description")}
        goBack={handleGoBack}
      >
        <VSpacer size={8} />
        <Image
          source={{ uri }}
          style={{
            height: maxHeight,
            width: maxScreenWidth,
            alignSelf: "center"
          }}
          accessibilityIgnoresInvertColors
        />
      </IOScrollViewWithLargeHeader>
    </SafeAreaView>
  );
};
