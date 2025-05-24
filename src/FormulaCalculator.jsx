import { useRef, useState } from 'react'
import './App.css'
import { useQuery } from '@tanstack/react-query'

function FormulaCalculator() {

    const subFormulaAutocompleteRef = useRef()
    const inputRef = useRef()
    const [searchTextValue, setSearchTextValue] = useState('')

    const FORMULA_FIELD_TYPES = {
        TEXT: 'text',
        OPERATOR: 'operator',
        FUNCTION: 'function',
    }

    const [formula, setFormula] = useState([
        { type: FORMULA_FIELD_TYPES.TEXT, value: 'start_func' },
        { type: FORMULA_FIELD_TYPES.OPERATOR, value: '+' },
        { type: FORMULA_FIELD_TYPES.TEXT, value: '12' },
        { type: FORMULA_FIELD_TYPES.OPERATOR, value: '+' },
        { type: FORMULA_FIELD_TYPES.TEXT, value: 'adm' },
        { type: FORMULA_FIELD_TYPES.OPERATOR, value: '-' },
        { type: FORMULA_FIELD_TYPES.TEXT, value: '4' },
        { type: FORMULA_FIELD_TYPES.OPERATOR, value: '+' },
        { type: FORMULA_FIELD_TYPES.FUNCTION, value: 'adm' },
    ])


    const fetchFormulaFunctions = async () => {
        console.log('Searching API for: ', searchTextValue)

        const res = await fetch(`https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete?search=${searchTextValue}`)
        if (!res.ok) throw new Error('Network response was not ok')
        const data = res.json()

        console.log('Data for autocomplete: ', data)
        return data
    }

    const { data: formulaFunctions, isLoading, error, refetch } = useQuery({
        queryKey: ['formulaFunctions'],
        queryFn: () => fetchFormulaFunctions(),
        enabled: false,
    })

    const hideFormulaOptions = () => {
        setSearchTextValue('');
        subFormulaAutocompleteRef.current.style.display = 'none';
    }

    const showFormulaOptions = async (searchText) => {
        setSearchTextValue(searchText);

        setTimeout(async () => {
            await refetch({
                queryKey: ['formulaFunctions', searchText],
                queryFn: () => fetchFormulaFunctions(searchText)
            })
    
            // Position the autocomplete dropdown below the input
            if (subFormulaAutocompleteRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                subFormulaAutocompleteRef.current.style.display = 'block';
                subFormulaAutocompleteRef.current.style.position = 'absolute';
                subFormulaAutocompleteRef.current.style.top = `${rect.bottom + 5}px`;
                subFormulaAutocompleteRef.current.style.left = `${rect.left}px`;
                subFormulaAutocompleteRef.current.style.width = '120px';
            }
        }, 300)

    }

    return (
        <>
            <div style={{
                width: '500px',
                display: 'block',
                position: 'relative',
            }}>
                <div style={{
                    width: '100%',
                    border: '1px solid #ccc',
                    padding: '4px',
                    borderRadius: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',

                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}>
                        {formula.map((field, idx) => (
                            <div key={idx}>
                                {field.value}
                            </div>
                        ))}
                    </div>
                    <input
                        ref={inputRef}
                        type="text"
                        style={{
                            border: 'none',
                            outline: 'none',
                            height: '40px',
                            fontSize: '16px',
                            background: 'transparent',
                        }}
                        onKeyDown={e => {
                            if (e.key === 'Backspace' && e.target.value === '') {
                                if (
                                    formula.length > 0 &&
                                    formula[formula.length - 1].type === FORMULA_FIELD_TYPES.FUNCTION
                                ) {
                                    const lastOperator = formula[formula.length - 2];
                                    setFormula(formula.slice(0, -2));

                                    /**
                                     * Use set time out cos setting directly does not seem to work
                                     */
                                    setTimeout(() => e.target.value = lastOperator.value, 5);
                                }
                                else if (formula.length >= 2) {
                                    const lastTwoValues = formula.slice(-2).map(f => f.value).join('');
                                    setFormula(formula.slice(0, -2));
                                    setTimeout(() => { e.target.value = lastTwoValues }, 5);
                                }
                                else if (formula.length === 1) {
                                    setFormula([]);
                                    setTimeout(() => { e.target.value = formula[0].value }, 5);
                                }
                            }
                        }}
                        onChange={e => {
                            const value = e.target.value;
                            if (/^[\+\-\*\/].+/.test(value)) {
                                // Value starts with an operator
                                // const operator = value[0];
                                const rest = value.slice(1).trim();

                                if (window._showFormulaOptionsTimeout) {
                                    clearTimeout(window._showFormulaOptionsTimeout);
                                }

                                if (!rest?.length) {
                                    return;
                                }

                                window._showFormulaOptionsTimeout = setTimeout(() => {
                                    showFormulaOptions(rest);
                                }, 350); 
                            }
                            else {
                                hideFormulaOptions()
                            }
                        }}
                    />

                </div>
                <div
                    ref={subFormulaAutocompleteRef}
                    style={{
                        display: 'none',
                        position: 'absolute',
                        top: '50px',
                        left: 0,
                        width: '120px',
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        zIndex: 100,
                        padding: '8px',
                        height: "120px",
                        overflowY: "scroll",
                    }}
                >
                    {isLoading && 'Loading...'}
                    {formulaFunctions && Array.isArray(formulaFunctions) && formulaFunctions.length > 0 && (

                            formulaFunctions.map((item, idx) => (
                                <div key={idx} style={{ padding: '8px', cursor: 'pointer' }}>
                                    {item.name}
                                </div>
                            ))

                    )}
                    {error && (
                        <>
                            Error loading autocomplete
                            <button onClick={() => refetch()}>Retry</button>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

export default FormulaCalculator
