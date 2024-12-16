export enum CieErrorType {
  GENERIC,
  TAG_NOT_VALID,
  WEB_VIEW_ERROR,
  NFC_ERROR,
  AUTHENTICATION_ERROR,
  PIN_ERROR,
  PIN_LOCKED,
  CERTIFICATE_ERROR
}

interface BaseCieError {
  message: string;
  type?: CieErrorType;
}

interface PinErrorOptions extends BaseCieError {
  type: CieErrorType.PIN_ERROR;
  attemptsLeft: number;
}

interface NonPinErrorOptions extends BaseCieError {
  type?: Exclude<CieErrorType, CieErrorType.PIN_ERROR>;
  attemptsLeft?: number;
}

type ErrorOptions = PinErrorOptions | NonPinErrorOptions;

export class CieError extends Error {
  public type: CieErrorType;
  public attemptsLeft?: number;
  constructor(options: ErrorOptions) {
    super(options.message);

    if (options.type) {
      this.type = options.type;
    } else {
      this.type = CieErrorType.GENERIC;
    }

    if (this.type === CieErrorType.PIN_ERROR) {
      this.attemptsLeft = options.attemptsLeft;
    } else if (this.type === CieErrorType.PIN_LOCKED) {
      this.attemptsLeft = 0;
    }

    this.name = this.constructor.name;
  }

  toString(): string {
    return JSON.stringify({
      name: this.name,
      type: CieErrorType[this.type],
      message: this.message,
      attemptsLeft: this.attemptsLeft
    });
  }
}
