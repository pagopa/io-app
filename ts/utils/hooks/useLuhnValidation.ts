interface TReturn {
  isCardNumberValid: boolean | undefined;
  isCvvNumberValid: boolean | undefined;
}

interface Props {
  cardNumber: string;
  cvvNumber: string;
}

/**
 * Luhn validation is an algorithm that allows you to check if a card inserted is really valid or not.
 * isCardNumberValid return true if the cardNumber is accepted and is validated.
 * @param isCardNumberValid
 * @param isCvvNumberValid
 */
export const useLuhnValidation = ({
  cardNumber,
  cvvNumber
}: Props): TReturn => {
  const onValidateCardNumber = (creditCard: string): boolean | undefined => {
    const MIN_CARD_LENGTH = 12; // The card with the shortest length is the 12-digit Maestro UK
    const MAX_AMAX_CARD_LENGTH = 16;
    const isAmexCard = /^3[47][0-9]{13}$/;

    // Remove all non digit characters
    const creditCardNumber = creditCard.replace(/\D/g, "");

    let sum = 0;
    let shouldDouble = false;
    // Loop through values starting at the rightmost side
    for (let i = creditCardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(creditCardNumber.charAt(i));
      if (shouldDouble) {
        if ((digit *= 2) > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    const isAmaxCompliant = isAmexCard.test(creditCardNumber)
      ? creditCardNumber.length < MAX_AMAX_CARD_LENGTH
      : true;

    // Luhn's algorithm predicts that the final sum, to be valid, must be divisible by 10.
    const isCardValid =
      cardNumber.length >= MIN_CARD_LENGTH && isAmaxCompliant && sum % 10 == 0;

    return !creditCard ? undefined : isCardValid;
  };

  const onValidateCVV = (
    creditCard: string,
    cvv: string
  ): boolean | undefined => {
    const IS_FOUR_DIGITS = /^\d{4}$/;
    const IS_TREE_DIGITS = /^\d{3}$/;
    const isAmexCard = /^3[47][0-9]{13}$/;

    const creditCardNumber = creditCard.replace(/\D/g, "");
    const cvvNumber = cvv.replace(/\D/g, "");

    // American express and cvv is 4 digits
    if (isAmexCard.test(creditCardNumber)) {
      if (IS_FOUR_DIGITS.test(cvvNumber)) return true;
    } else if (IS_TREE_DIGITS.test(cvvNumber)) {
      // Other card & cvv is 3 digits
      return true;
    }
    return !cvv ? undefined : false;
  };

  const isCardNumberValid = onValidateCardNumber(cardNumber);
  const isCvvNumberValid = onValidateCVV(cardNumber, cvvNumber);

  return {
    isCardNumberValid,
    isCvvNumberValid
  };
};
