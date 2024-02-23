import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import {
  ButtonSolid,
  IOColors,
  Icon,
  HSpacer,
  VSpacer,
  ContentWrapper
} from "@pagopa/io-app-design-system";
import { Body } from "../../../../components/core/typography/Body";
import { H4 } from "../../../../components/core/typography/H4";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import LegacyMarkdown from "../../../../components/ui/Markdown/LegacyMarkdown";
import I18n from "../../../../i18n";
import { useIOBottomSheetAutoresizableModal } from "../../../../utils/hooks/bottomSheet";

type Props = {
  content: string;
};

const InitiativeRulesInfoBox = (props: Props) => {
  const { content } = props;

  const { bottomSheet, present, dismiss } = useIOBottomSheetAutoresizableModal(
    {
      component: <LegacyMarkdown>{content}</LegacyMarkdown>,
      title: I18n.t("idpay.initiative.beneficiaryDetails.infoModal.title"),
      footer: (
        <ContentWrapper>
          <VSpacer size={24} />
          <ButtonSolid
            label={I18n.t(
              "idpay.initiative.beneficiaryDetails.infoModal.button"
            )}
            onPress={() => dismiss()}
            accessibilityLabel={I18n.t(
              "idpay.initiative.beneficiaryDetails.infoModal.button"
            )}
            fullWidth={true}
          />
          <VSpacer size={24} />
        </ContentWrapper>
      )
    },
    170
  );

  return (
    <>
      <View style={styles.infoBox}>
        <H4>{I18n.t("idpay.initiative.beneficiaryDetails.infobox.title")}</H4>
        <VSpacer size={4} />
        <Body numberOfLines={3} ellipsizeMode="tail">
          {content}
        </Body>
        <VSpacer size={16} />
        <View style={IOStyles.row}>
          <Icon name="categLearning" color="blue" />
          <HSpacer size={8} />
          <Link onPress={() => present()}>
            {I18n.t("idpay.initiative.beneficiaryDetails.infobox.rulesButton")}
          </Link>
        </View>
      </View>
      <VSpacer size={16} />
      {bottomSheet}
    </>
  );
};

const InitiativeRulesInfoBoxSkeleton = () => (
  <View style={styles.infoBox}>
    <Placeholder.Box animate="fade" height={24} width={"40%"} radius={4} />
    <VSpacer size={16} />
    {Array.from({ length: 4 }).map((_, i) => (
      <View key={i}>
        <Placeholder.Box animate="fade" height={16} width={"100%"} radius={4} />
        <VSpacer size={4} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  infoBox: {
    borderColor: IOColors.bluegreyLight,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 20
  }
});

export { InitiativeRulesInfoBox, InitiativeRulesInfoBoxSkeleton };
