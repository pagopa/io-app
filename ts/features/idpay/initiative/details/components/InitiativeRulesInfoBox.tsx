import React from "react";
import { StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { ContentWrapper } from "../../../../../components/core/ContentWrapper";
import { Icon } from "../../../../../components/core/icons";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { Link } from "../../../../../components/core/typography/Link";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import ButtonSolid from "../../../../../components/ui/ButtonSolid";
import Markdown from "../../../../../components/ui/Markdown";
import I18n from "../../../../../i18n";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";

type Props = {
  content: string;
};

const InitiativeRulesInfoBox = (props: Props) => {
  const { content } = props;

  const { bottomSheet, present, dismiss } = useIOBottomSheetModal(
    <Markdown>{content}</Markdown>,
    <H3>{I18n.t("idpay.initiative.beneficiaryDetails.infoModal.title")}</H3>,
    700,
    <ContentWrapper>
      <VSpacer size={16} />
      <ButtonSolid
        label={I18n.t("idpay.initiative.beneficiaryDetails.infoModal.button")}
        onPress={() => dismiss()}
        accessibilityLabel={I18n.t(
          "idpay.initiative.beneficiaryDetails.infoModal.button"
        )}
        fullWidth={true}
      />
      <VSpacer size={32} />
    </ContentWrapper>
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
