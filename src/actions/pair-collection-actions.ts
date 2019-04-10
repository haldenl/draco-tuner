import { AnyAction } from 'redux';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { createAction } from 'typesafe-actions';
import { SpecDictionaryObject } from '../model';
import { RootState } from '../reducers';
import { reloadPairsBegin } from './draco-worker-actions';

export const reloadPairsThunk = (): ThunkAction<void, {}, {}, AnyAction> => {
  return (dispatch: ThunkDispatch<{}, {}, AnyAction>, getState: () => RootState) => {
    const pairs = getState().pairCollection.pairs;
    dispatch(reloadPairsBegin(pairs));
  };
};

export const setPairs = createAction('pairs-collection/SET_PAIRS', action => {
  return (specDict: SpecDictionaryObject) => action(specDict);
});

export const toggleFocusPair = createAction('pair-collection/TOGGLE_FOCUS_PAIR', action => {
  return (id: string, on: boolean) => action({ id, on });
});
