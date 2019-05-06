import { constraints } from 'draco-vis';
import { createReducer } from 'redux-starter-kit';
import { ActionType, getType } from 'typesafe-actions';
import { TextEditorAction, textEditorActions } from '../actions/index';
import { AspPrograms, AspProgramsObject, AspProgramsType } from '../model/asp-program';
import { ConstraintMap } from '../model/index';
import { constraintMap } from './draco-reducer';

export interface TextEditorStore {
  vegalite: VegaLiteStore;
  asp: AspProgramsObject;
  selectedEditor: EditorType;
  aspProgram: AspProgramsType;
}

export class Editor {
  static VEGA_LITE: 'vegalite' = 'vegalite';
  static ASP: 'asp' = 'asp';
}

export type EditorType = typeof Editor.VEGA_LITE | typeof Editor.ASP;

export interface VegaLiteStore {
  code: string;
}

const constraintAspPrograms = ConstraintMap.toAspPrograms(constraintMap);

export const TEXT_EDITOR_REDUCER_INITIAL_STATE: TextEditorStore = {
  vegalite: {
    code: '',
  },
  asp: {
    ...constraintAspPrograms,
    hardIntegrity: constraints.HARD_INTEGRITY,
    define: constraints.DEFINE,
    optimize: constraints.OPTIMIZE,
    output: constraints.OUTPUT,
    generate: constraints.GENERATE,
    topkLua: constraints.TOPK_LUA,
  },
  selectedEditor: Editor.VEGA_LITE,
  aspProgram: AspPrograms.SOFT_DEFINE,
};

export const textEditorReducer = createReducer<TextEditorStore, TextEditorAction>(TEXT_EDITOR_REDUCER_INITIAL_STATE, {
  [getType(textEditorActions.setVegaLiteCode)]: setVegaLiteCode,
  [getType(textEditorActions.setEditorType)]: setEditorType,
  [getType(textEditorActions.setAspEditorProgram)]: setAspEditorProgram,
  [getType(textEditorActions.setAspCode)]: setAspCode,
});

export default textEditorReducer;

function setVegaLiteCode(state: TextEditorStore, action: ActionType<typeof textEditorActions.setVegaLiteCode>): void {
  state.vegalite.code = action.payload;
}

function setEditorType(state: TextEditorStore, action: ActionType<typeof textEditorActions.setEditorType>): void {
  state.selectedEditor = action.payload;
}

function setAspEditorProgram(
  state: TextEditorStore,
  action: ActionType<typeof textEditorActions.setAspEditorProgram>
): void {
  state.aspProgram = action.payload;
}

function setAspCode(state: TextEditorStore, action: ActionType<typeof textEditorActions.setAspCode>): void {
  state.asp = AspPrograms.setProgramWithType(state.asp, action.payload.programType, action.payload.code);
}
