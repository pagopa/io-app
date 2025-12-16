import {
  Body,
  H6,
  IOButton,
  IOColors,
  IOSkeleton,
  useIOTheme,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import IOMarkdown from "../../../../components/IOMarkdown";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { markdownToPlainText } from "../../../../utils/markdown";
import { isAndroid } from "../../../../utils/platform";

type Props = {
  content: string;
};

const IdPayInitiativeRulesInfoBox = (props: Props) => {
  const theme = useIOTheme();
  const { content } = props;

  const { bottomSheet, present } = useIOBottomSheetModal({
    component: (
      <>
        <IOMarkdown content={content} />
        {isAndroid && <VSpacer size={24} />}
      </>
    ),
    title: I18n.t("idpay.initiative.beneficiaryDetails.infoModal.title")
  });

  return (
    <>
      <View
        style={[
          styles.infoBox,
          // TODO: add a new theme key for more visible card border
          { borderColor: IOColors[theme["textInputBorder-default"]] }
        ]}
      >
        <H6>{I18n.t("idpay.initiative.beneficiaryDetails.infobox.title")}</H6>
        <VSpacer size={4} />
        <Body numberOfLines={3} ellipsizeMode="tail">
          {markdownToPlainText(content)}
        </Body>
        <VSpacer size={16} />
        <View style={{ flexDirection: "row" }}>
          <IOButton
            iconPosition="end"
            variant="link"
            label={I18n.t(
              "idpay.initiative.beneficiaryDetails.infobox.rulesButton"
            )}
            onPress={present}
            icon="categLearning"
          />
        </View>
      </View>
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};

const IdPayInitiativeRulesInfoBoxSkeleton = () => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        styles.infoBox,
        { borderColor: IOColors[theme["textInputBorder-default"]] }
      ]}
    >
      <IOSkeleton shape="rectangle" width={"40%"} height={24} radius={4} />
      <VSpacer size={16} />
      <VStack space={4}>
        {Array.from({ length: 4 }).map((_, i) => (
          <IOSkeleton
            key={i}
            shape="rectangle"
            height={16}
            width={"100%"}
            radius={4}
          />
        ))}
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16
  }
});

export { IdPayInitiativeRulesInfoBox, IdPayInitiativeRulesInfoBoxSkeleton };
