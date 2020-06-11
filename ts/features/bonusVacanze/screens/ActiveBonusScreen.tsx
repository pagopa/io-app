import { fromNullable } from "fp-ts/lib/Option";
import { Badge, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { BonusActivationStatusEnum } from "../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import DarkLayout from "../../../components/screens/DarkLayout";
import TouchableDefaultOpacity from "../../../components/TouchableDefaultOpacity";
import BlockButtons from "../../../components/ui/BlockButtons";
import IconFont from "../../../components/ui/IconFont";
import {
  BottomTopAnimation,
  LightModalContextInterface
} from "../../../components/ui/LightModal";
import I18n from "../../../i18n";
import { navigateBack } from "../../../store/actions/navigation";
import { Dispatch } from "../../../store/actions/types";
import variables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import { shareBase64Content } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { formatNumberAmount } from "../../../utils/stringBuilder";
import QrModalBox from "../components/QrModalBox";
import { isBonusActive } from "../utils/bonus";

type QRCodeContents = {
  [key: string]: string;
};

type NavigationParams = Readonly<{
  bonus: BonusActivationWithQrCode;
  validFrom?: Date;
  validTo?: Date;
}>;

const QR_CODE_MIME_TYPE = "svg+xml";
const PNG_IMAGE_TYPE = "image/png";

type Props = NavigationInjectedProps<NavigationParams> &
  ReturnType<typeof mapDispatchToProps> &
  LightModalContextInterface;

const styles = StyleSheet.create({
  emptyHeader: { height: 90 },
  title: {
    color: variables.lightGray,
    fontSize: variables.fontSize1
  },
  image: {
    position: "absolute",
    top: -144,
    resizeMode: "stretch",
    height: 168,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    zIndex: 7,
    elevation: 7,
    alignSelf: "center",
    backgroundColor: variables.contentPrimaryBackground
  },
  center: {
    alignSelf: "center"
  },
  validUntil: {
    color: variables.brandDarkestGray,
    fontSize: variables.fontSizeSmall
  },
  rowBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  paddedContent: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },
  helpButton: {
    alignSelf: "center"
  },
  statusBadgeActive: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.contentPrimaryBackground
  },
  statusBadgeRevoked: {
    height: 18,
    marginTop: 2,
    backgroundColor: variables.textColor
  },
  statusText: {
    fontSize: 12,
    lineHeight: 16
  },
  colorDarkest: {
    color: variables.brandDarkestGray
  },
  colorGrey: {
    color: variables.textColor
  },
  sectionLabel: {
    fontSize: variables.fontSize1,
    lineHeight: 21
  },
  commonLabel: {
    fontSize: variables.fontSizeSmall,
    lineHeight: 18
  },
  fmName: {
    fontSize: variables.fontSize1,
    lineHeight: 21
  },
  amount: {
    fontSize: variables.fontSize2
  }
});

const renderQRCode = (base64: string) =>
  fromNullable(base64).fold(null, s => (
    <SvgXml xml={s} height="100%" width="100%" />
  ));

const renderFiscalCodeLine = (name: string, cf: string) => {
  return (
    <React.Fragment key={cf}>
      <View style={styles.rowBlock}>
        <Text style={[styles.fmName, styles.colorGrey]}>{name}</Text>
        <Text style={[styles.fmName, styles.colorGrey]} semibold={true}>
          {cf}
        </Text>
      </View>
      <View spacer={true} small={true} />
    </React.Fragment>
  );
};

async function readBase64Svg(bonusWithQrCode: BonusActivationWithQrCode) {
  return new Promise<QRCodeContents>((res, _) => {
    const qrCodes: BonusActivationWithQrCode["qr_code"] = [
      ...bonusWithQrCode.qr_code
    ];
    const content = qrCodes.reduce<QRCodeContents>(
      (acc: QRCodeContents, curr: BonusActivationWithQrCode["qr_code"][0]) => {
        // for svg we need to convert base64 content to ascii to be rendered
        if (curr.mime_type === QR_CODE_MIME_TYPE) {
          return {
            ...acc,
            [curr.mime_type]: Buffer.from(curr.content, "base64").toString(
              "ascii"
            )
          };
        } else {
          return {
            ...acc,
            [curr.mime_type]: curr.content
          };
        }
      },
      {}
    );
    res(content);
  });
}

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.fiscalCode.title",
  body: "profile.fiscalCode.help"
};

const ActiveBonusScreen: React.FunctionComponent<Props> = (props: Props) => {
  const [qrCode, setQRCode] = React.useState<QRCodeContents>({});

  const bonus = props.navigation.getParam("bonus");

  const shareQR = async (content: string, code: string) => {
    const shared = await shareBase64Content(content, code).run();
    if (shared.isLeft()) {
      showToast(I18n.t("global.genericError"));
    }
  };

  React.useEffect(() => {
    readBase64Svg(bonus)
      .then(cc => setQRCode(cc))
      .catch(_ => undefined);
  }, []);

  const bonusStatusDescription = I18n.t(`bonus.${bonus.status.toLowerCase()}`, {
    defaultValue: ""
  });

  const renderFooterButtons = () =>
    isBonusActive(bonus) ? (
      <BlockButtons
        type="TwoButtonsInlineHalf"
        rightButton={{
          primary: true,
          iconName: "io-share",
          iconColor: variables.colorWhite,
          title: I18n.t("global.buttons.share"),
          onPress: () =>
            shareQR(
              qrCode[PNG_IMAGE_TYPE],
              `${I18n.t("bonus.bonusVacanza.shareMessage")} ${bonus.id}`
            )
        }}
        leftButton={{
          bordered: true,
          iconName: "io-qr",
          iconColor: variables.contentPrimaryBackground,
          title: I18n.t("bonus.bonusVacanza.cta.qrCode"),
          onPress: () =>
            props.showAnimatedModal(
              <QrModalBox
                secretCode={bonus.id}
                onClose={props.hideModal}
                qrCode={qrCode[QR_CODE_MIME_TYPE]}
              />,
              BottomTopAnimation
            )
        }}
      />
    ) : (
      <BlockButtons
        type="SingleButton"
        leftButton={{
          bordered: true,
          title: I18n.t("global.buttons.cancel"),
          onPress: props.goBack
        }}
      />
    );

  return (
    <DarkLayout
      bounces={false}
      headerBody={
        <TouchableDefaultOpacity onPress={props.goBack} style={styles.center}>
          <Text style={styles.title}>{I18n.t("bonus.bonusVacanza.name")}</Text>
        </TouchableDefaultOpacity>
      }
      contextualHelpMarkdown={contextualHelpMarkdown}
      allowGoBack={true}
      topContent={<View style={{ height: 90 }} />}
      faqCategories={["profile"]}
      footerContent={renderFooterButtons()}
    >
      <View>
        <View style={styles.paddedContent}>
          <View style={styles.image}>
            {renderQRCode(qrCode[QR_CODE_MIME_TYPE])}
          </View>
          <View spacer={true} extralarge={true} />
          <View style={styles.rowBlock}>
            <IconFont
              name={isBonusActive(bonus) ? "io-calendario" : "io-notice"}
              color={variables.textColor}
              size={variables.fontSize3}
            />
            <View style={styles.paddedContent}>
              <Text style={[styles.validUntil]} semibold={true}>
                {isBonusActive(bonus)
                  ? I18n.t("bonus.bonusVacanza.validBetween")
                  : I18n.t("bonus.bonusVacanza.bonusRejected")}
              </Text>
            </View>
          </View>
          <View spacer={true} />
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} />
          <View style={styles.rowBlock}>
            <Text
              semibold={true}
              style={[styles.colorDarkest, styles.sectionLabel]}
            >
              {I18n.t("bonus.bonusVacanza.amount")}
            </Text>
            <Text semibold={true} style={[styles.amount, styles.colorDarkest]}>
              {formatNumberAmount(bonus.dsu_request.max_amount, true)}
            </Text>
          </View>
          <View spacer={true} />
          <View style={styles.rowBlock}>
            <Text style={[styles.colorGrey, styles.commonLabel]}>
              {I18n.t("bonus.bonusVacanza.usableAmount")}
            </Text>
            <Text bold={true} style={[styles.colorGrey, styles.commonLabel]}>
              {formatNumberAmount(
                bonus.dsu_request.max_amount -
                  bonus.dsu_request.max_tax_benefit,
                true
              )}
            </Text>
          </View>
          <View spacer={true} small={true} />
          <View spacer={true} xsmall={true} />
          <View style={styles.rowBlock}>
            <Text style={[styles.colorGrey, styles.commonLabel]}>
              {I18n.t("bonus.bonusVacanza.taxBenefit")}
            </Text>
            <Text style={[styles.colorGrey, styles.commonLabel]}>
              {formatNumberAmount(bonus.dsu_request.max_tax_benefit, true)}
            </Text>
          </View>
          <View spacer={true} />
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} />
          <Text
            semibold={true}
            style={[styles.sectionLabel, styles.colorDarkest]}
          >
            {I18n.t("bonus.bonusVacanza.bonusClaim")}
          </Text>
          <View spacer={true} />
          {bonus.dsu_request.family_members.map(member =>
            renderFiscalCodeLine(
              `${member.name} ${member.surname}`,
              member.fiscal_code
            )
          )}
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} />
          {bonusStatusDescription.length > 0 && (
            <View style={styles.rowBlock}>
              <Text
                semibold={true}
                style={[styles.sectionLabel, styles.colorDarkest]}
              >
                {I18n.t("bonus.bonusVacanza.status")}
              </Text>
              <Badge
                style={
                  isBonusActive(bonus)
                    ? styles.statusBadgeActive
                    : styles.statusBadgeRevoked
                }
              >
                <Text style={styles.statusText} semibold={true}>
                  {bonusStatusDescription}
                </Text>
              </Badge>
            </View>
          )}
          <View spacer={true} />
          <View style={styles.rowBlock}>
            <Text style={[styles.colorGrey, styles.commonLabel]}>
              {I18n.t("bonus.bonusVacanza.requestedAt")}
            </Text>
            <Text style={[styles.colorGrey, styles.commonLabel]}>
              {isBonusActive(bonus)
                ? formatDateAsLocal(bonus.created_at, true)
                : fromNullable(bonus.redeemed_at).fold(
                    formatDateAsLocal(bonus.created_at, true),
                    d => formatDateAsLocal(d, true)
                  )}
            </Text>
          </View>
        </View>
      </View>
    </DarkLayout>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(navigateBack())
});

export default connect(
  undefined,
  mapDispatchToProps
)(withLightModalContext(ActiveBonusScreen));
