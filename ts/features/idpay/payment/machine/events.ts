export type AuthorizePayment = {
  readonly type: "authorize-payment";
  readonly trxCode: string;
  readonly data_entry?: "qr_code" | "manual";
};

export type Next = {
  readonly type: "next";
};

export type Back = {
  readonly type: "back";
};

export type Close = {
  readonly type: "close";
};

export type Events = Next | Back | Close | AuthorizePayment;
