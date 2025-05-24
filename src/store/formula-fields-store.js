import { create } from 'zustand'
import { FORMULA_FIELD_TYPES } from '../consts';

export const useFormulaFieldsStore = create((set) => ({
    formulae: [
        { type: FORMULA_FIELD_TYPES.OPERATOR, value: '+' },
        { type: FORMULA_FIELD_TYPES.TEXT, value: '13' },
        { type: FORMULA_FIELD_TYPES.OPERATOR, value: '*' },
        { type: FORMULA_FIELD_TYPES.TEXT, value: '120' },
    ],

    push: ({ operatorName, value, type, label}) => {
        set((state) => ({
            formulae: [
                ...state.formulae,
                { type: FORMULA_FIELD_TYPES.OPERATOR, value: operatorName },
                { type: type ?? FORMULA_FIELD_TYPES.TEXT, value: value, label: label ?? null },
            ],
        }));
    },

    pop: () => {
        let lastOperator;
        let lastOperand;
        
        set((state) => {
            if (state.formulae.length < 2) return { ...state };

            lastOperator = state.formulae?.[state.formulae.length - 2] ?? null;
            lastOperand = state.formulae?.[state.formulae.length - 1] ?? null;

            return { formulae: state.formulae.slice(0, -2) }
        });

        return {operator: lastOperator?.value ?? null, value: lastOperand?.value ?? null};
    },

    calculate: () => {
        
    }
}))