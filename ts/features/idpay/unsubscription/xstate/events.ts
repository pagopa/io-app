type E_EXIT = {
  type: "EXIT";
};

type E_SELECT_INITIATIVE = {
  type: "SELECT_INITIATIVE";
  initiativeId: string;
  initiativeName?: string;
};

type E_TOGGLE_CHECK = {
  type: "TOGGLE_CHECK";
  index: number;
};

type E_CONFIRM_UNSUBSCRIPTION = {
  type: "CONFIRM_UNSUBSCRIPTION";
};

export type Events =
  | E_EXIT
  | E_SELECT_INITIATIVE
  | E_TOGGLE_CHECK
  | E_CONFIRM_UNSUBSCRIPTION;
