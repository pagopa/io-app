const generateRandomNumberString = (length: number) => {
  const characters = "0123456789";

  return Array.from(Array(length).keys())
    .map(() => {
      const randomIndex = Math.floor(Math.random() * characters.length);
      return characters[randomIndex];
    })
    .join("");
};

export const generateValidRandomRptIdString = () => {
  const organizationFiscalCode = generateRandomNumberString(11);
  const paymentNoticeNumber = "002" + generateRandomNumberString(15);

  return `${organizationFiscalCode}${paymentNoticeNumber}`;
};
