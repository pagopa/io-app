const euCovidCertValidSubject = "🏥 EUCovidCert - valid";

export const learnMoreLinkTestId = "euCovidCertLearnMoreLink";
export const messageListTestId = "MessageList_inbox";
export const qrCodeTestId = "QRCode";
export const fullScreenQrCodeTestId = "fullScreenQRCode";

export const scrollToEUCovidMessage = async (messageSubject: string) => {
  await waitFor(element(by.text(messageSubject)))
    .toBeVisible()
    .whileElement(by.id(messageListTestId))
    .scroll(350, "down");
};

export const openValidEUCovidMessage = async () => {
  await scrollToEUCovidMessage(euCovidCertValidSubject);

  const subject = element(by.text(euCovidCertValidSubject));
  await subject.tap();
};
