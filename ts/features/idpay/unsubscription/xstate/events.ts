type E_EXIT = {
  type: "EXIT";
};

type E_CONFIRM_UNSUBSCRIPTION = {
  type: "CONFIRM_UNSUBSCRIPTION";
};

export type Events = E_EXIT | E_CONFIRM_UNSUBSCRIPTION;
