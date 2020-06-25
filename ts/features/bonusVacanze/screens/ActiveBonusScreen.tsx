import { fromNullable } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Badge, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { BonusActivationStatusEnum } from "../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { withLightModalContext } from "../../../components/helpers/withLightModalContext";
import ItemSeparatorComponent from "../../../components/ItemSeparatorComponent";
import { ContextualHelpPropsMarkdown } from "../../../components/screens/BaseScreenComponent";
import DarkLayout from "../../../components/screens/DarkLayout";
import { EdgeBorderComponent } from "../../../components/screens/EdgeBorderComponent";
import GenericErrorComponent from "../../../components/screens/GenericErrorComponent";
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
import { GlobalState } from "../../../store/reducers/types";
import variables from "../../../theme/variables";
import customVariables from "../../../theme/variables";
import { formatDateAsLocal } from "../../../utils/dates";
import { shareBase64Content } from "../../../utils/share";
import { showToast } from "../../../utils/showToast";
import { formatNumberAmount } from "../../../utils/stringBuilder";
import { maybeNotNullyString } from "../../../utils/strings";
import BonusCardComponent from "../components/BonusCardComponent";
import QrModalBox from "../components/QrModalBox";
import {
  cancelLoadBonusFromIdPolling,
  startLoadBonusFromIdPolling
} from "../store/actions/bonusVacanze";
import { bonusActiveDetailByIdSelector } from "../store/reducers/allActive";
import { availableBonusTypesSelectorFromId } from "../store/reducers/availableBonusesTypes";
import {
  getBonusCodeFormatted,
  ID_BONUS_VACANZE_TYPE,
  isBonusActive,
  validityInterval
} from "../utils/bonus";

type QRCodeContents = {
  [key: string]: string;
};

type NavigationParams = Readonly<{
  bonus: BonusActivationWithQrCode;
  validFrom?: Date;
  validTo?: Date;
}>;

const QR_CODE_MIME_TYPE = "image/svg+xml";
const PNG_IMAGE_TYPE = "image/png";

type OwnProps = NavigationInjectedProps<NavigationParams>;

type Props = OwnProps &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
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
    alignSelf: "center"
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
    // alignItems: "center",
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
    flex: 1,
    lineHeight: 21,
    alignSelf: "flex-start"
  },
  textRight: {
    textAlign: "right"
  },
  textLeft: {
    textAlign: "left"
  },
  amount: {
    fontSize: variables.fontSize2
  }
});

const renderFiscalCodeLine = (name: string, cf: string) => {
  return (
    <React.Fragment key={cf}>
      <View style={styles.rowBlock}>
        <Text style={[styles.fmName, styles.colorGrey, styles.textLeft]}>
          {name}
        </Text>
        <Text
          style={[styles.fmName, styles.colorGrey, styles.textRight]}
          semibold={true}
        >
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
  title: "bonus.bonusVacanze.detail.contextualHelp.title",
  body: "bonus.bonusVacanze.detail.contextualHelp.body"
};

const shareQR = async (content: string, code: string, errorMessage: string) => {
  const shared = await shareBase64Content(content, code).run();
  shared.mapLeft(_ => showToast(errorMessage));
};

const startRefreshPollingAfter = 3000 as Millisecond;
// tslint:disable-next-line: no-big-function
const ActiveBonusScreen: React.FunctionComponent<Props> = (props: Props) => {
  const [qrCode, setQRCode] = React.useState<QRCodeContents>({});
  const bonusFromNav = props.navigation.getParam("bonus");
  const bonus = pot.getOrElse(props.bonus, bonusFromNav);

  React.useEffect(() => {
    // start refresh polling after startRefreshPollingAfter
    const delayedPolling = setTimeout(() => {
      // When mounting the component starts a polling to update the bonus information at runtime
      props.startPollingBonusFromId(bonusFromNav.id);
    }, startRefreshPollingAfter);

    if (bonus) {
      readBase64Svg(bonus)
        .then(cc => setQRCode(cc))
        .catch(_ => undefined);
    }
    return () => {
      // When the component unmounts demands the stop to the polling saga
      props.cancelPollingBonusFromId();
      clearTimeout(delayedPolling);
    };
  }, []);

  // translate the bonus status. If no mapping found -> empty string
  const maybeStatusDescription = maybeNotNullyString(
    bonus
      ? I18n.t(`bonus.${bonus.status.toLowerCase()}`, {
          defaultValue: ""
        })
      : ""
  );

  const openModalBox = () => {
    const modalBox = (
      <QrModalBox
        secretCode={getBonusCodeFormatted(bonus)}
        onClose={props.hideModal}
        qrCode={qrCode[QR_CODE_MIME_TYPE]}
      />
    );
    props.showAnimatedModal(modalBox, BottomTopAnimation);
  };

  const renderFooterButtons = () =>
    bonus && isBonusActive(bonus) ? (
      <>
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
                `${I18n.t("bonus.bonusVacanze.shareMessage")} ${
                  bonusFromNav.id
                }`,
                I18n.t("global.genericError")
              )
          }}
          leftButton={{
            bordered: true,
            iconName: "io-qr",
            iconColor: variables.contentPrimaryBackground,
            title: I18n.t("bonus.bonusVacanze.cta.qrCode"),
            onPress: openModalBox
          }}
        />
        <View spacer={true} />
      </>
    ) : (
      <>
        <BlockButtons
          type="SingleButton"
          leftButton={{
            bordered: true,
            title: I18n.t("global.buttons.cancel"),
            onPress: props.goBack
          }}
        />
        <View spacer={true} />
      </>
    );

  const renderInformationBlock = (
    icon: string,
    text: string,
    iconColor?: string
  ) => (
    <View style={styles.rowBlock}>
      <IconFont
        name={icon}
        color={fromNullable(iconColor).getOrElse(variables.textColor)}
        size={variables.fontSize3}
      />
      <View style={styles.paddedContent}>
        <Text style={[styles.validUntil]} semibold={true}>
          {text}
        </Text>
      </View>
    </View>
  );

  const switchInformationText = () => {
    switch (bonus.status) {
      case BonusActivationStatusEnum.ACTIVE:
        return renderInformationBlock(
          "io-calendario",
          I18n.t("bonus.bonusVacanze.statusInfo.validBetween", {
            from: bonusValidityInterval.fold("n/a", v => v.e1),
            to: bonusValidityInterval.fold("n/a", v => v.e2)
          })
        );
      case BonusActivationStatusEnum.REDEEMED:
        return renderInformationBlock(
          "io-complete",
          I18n.t("bonus.bonusVacanze.statusInfo.redeemed", {
            date: formatDateAsLocal(
              fromNullable(bonus.redeemed_at).getOrElse(bonus.created_at),
              true
            )
          }),
          customVariables.brandSuccess
        );
      case BonusActivationStatusEnum.FAILED:
        return renderInformationBlock(
          "io-notice",
          I18n.t("bonus.bonusVacanze.statusInfo.bonusRejected")
        );
      default:
        return null;
    }
  };

  const from = props.bonusInfo.map(bi => bi.valid_from);
  const to = props.bonusInfo.map(bi => bi.valid_to);
  const bonusValidityInterval = validityInterval(
    from.toUndefined(),
    to.toUndefined()
  );
  return !props.isError && bonus ? (
    <DarkLayout
      bounces={false}
      headerBody={
        <TouchableDefaultOpacity onPress={props.goBack} style={styles.center}>
          <Text style={styles.title}>{I18n.t("bonus.bonusVacanze.name")}</Text>
        </TouchableDefaultOpacity>
      }
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={["bonus_detail"]}
      allowGoBack={true}
      topContent={<View style={{ height: 90 }} />}
      footerContent={renderFooterButtons()}
      gradientHeader={true}
    >
      <View>
        <View style={styles.paddedContent}>
          <View style={styles.image}>
            <BonusCardComponent bonus={bonus} viewQR={openModalBox} />
          </View>
          <View spacer={true} extralarge={true} />
          {switchInformationText()}
          <View spacer={true} />
          <ItemSeparatorComponent noPadded={true} />
          <View spacer={true} />
          <View style={styles.rowBlock}>
            <Text
              semibold={true}
              style={[styles.colorDarkest, styles.sectionLabel]}
            >
              {I18n.t("bonus.bonusVacanze.amount")}
            </Text>
            <Text semibold={true} style={[styles.amount, styles.colorDarkest]}>
              {formatNumberAmount(bonus.dsu_request.max_amount, true)}
            </Text>
          </View>
          <View spacer={true} />
          <View style={styles.rowBlock}>
            <Text style={[styles.colorGrey, styles.commonLabel]}>
              {I18n.t("bonus.bonusVacanze.usableAmount")}
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
              {I18n.t("bonus.bonusVacanze.taxBenefit")}
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
            {I18n.t("bonus.bonusVacanze.bonusClaim")}
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
          {maybeStatusDescription.isSome() && (
            <View style={styles.rowBlock}>
              <Text
                semibold={true}
                style={[styles.sectionLabel, styles.colorDarkest]}
              >
                {I18n.t("bonus.bonusVacanze.status")}
              </Text>
              <Badge
                style={
                  isBonusActive(bonus)
                    ? styles.statusBadgeActive
                    : styles.statusBadgeRevoked
                }
              >
                <Text style={styles.statusText} semibold={true}>
                  {maybeStatusDescription.value}
                </Text>
              </Badge>
            </View>
          )}
          <View spacer={true} />
          <View style={styles.rowBlock}>
            <Text style={[styles.colorGrey, styles.commonLabel]}>
              {I18n.t("bonus.bonusVacanze.requestedAt")}
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
          <EdgeBorderComponent />
        </View>
      </View>
    </DarkLayout>
  ) : (
    <GenericErrorComponent
      onRetry={() => props.startPollingBonusFromId(bonusFromNav.id)}
      onCancel={props.goBack}
    />
  );
};

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => {
  const bonusFromNav = ownProps.navigation.getParam("bonus");
  const bonus = bonusActiveDetailByIdSelector(bonusFromNav.id)(state);
  return {
    bonusInfo: availableBonusTypesSelectorFromId(ID_BONUS_VACANZE_TYPE)(state),
    bonus,
    isError: pot.isNone(bonus) && pot.isError(bonus) // error and no bonus data, user should retry to load
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
  goBack: () => dispatch(navigateBack()),
  startPollingBonusFromId: (id: string) =>
    dispatch(startLoadBonusFromIdPolling(id)),
  cancelPollingBonusFromId: () => dispatch(cancelLoadBonusFromIdPolling())
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(ActiveBonusScreen));
