import { UPDATE_EDITOR_CODE } from '../actions';

export const SCATTER: string = `% ====== Data definitions ======
data("cars.json").
num_rows(142).

fieldtype(horsepower,number).
cardinality(horsepower,94).

fieldtype(acceleration,number).
cardinality(acceleration,96).

% ====== Query constraints ======
encoding(e0).
:- not field(e0,acceleration).

encoding(e1).
:- not field(e1,horsepower).
`;

export const INITIAL_STATE = {
  code: SCATTER,
};

const editor = (state: any = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case UPDATE_EDITOR_CODE:
      return {
        ...state,
        code: action.value,
      };
    default:
      return state;
  }
};

export default editor;