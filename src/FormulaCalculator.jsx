import { useRef, useState } from 'react'
import './App.css'
import { useQuery } from '@tanstack/react-query'
import { useFormulaFieldsStore } from './store/formula-fields-store'

function FormulaCalculator() {

    const formulae = useFormulaFieldsStore(state => state.formulae);
    const push = useFormulaFieldsStore(state => state.push);
    const pop = useFormulaFieldsStore(state => state.pop);

    const subFormulaAutocompleteRef = useRef()
    const inputRef = useRef()
    const [searchTextValue, setSearchTextValue] = useState('')


    const fetchFormulaFunctions = async () => {
        const res = await fetch(`https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete?search=${searchTextValue}`)
        return !res.ok ? [] : res.json()
    }

    const { data: formulaFunctions, isLoading, error, refetch } = useQuery({
        queryKey: ['formulaFunctions'],
        queryFn: () => fetchFormulaFunctions(),
        enabled: false,
    })

    const hideFormulaOptions = () => {
        setSearchTextValue('');

        if (subFormulaAutocompleteRef.current) {
            subFormulaAutocompleteRef.current.style.display = 'none';
        }
    }

    const showFormulaOptions = async (searchText) => {
        setSearchTextValue(searchText);

        setTimeout(async () => {
            await refetch({
                queryKey: ['formulaFunctions', searchText],
                queryFn: () => fetchFormulaFunctions(searchText)
            })
    
            if (!formulaFunctions?.length) {
                hideFormulaOptions()
                return;
            }
            
            if (subFormulaAutocompleteRef.current) {
                const rect = inputRef.current.getBoundingClientRect();
                subFormulaAutocompleteRef.current.style.display = 'block';
                subFormulaAutocompleteRef.current.style.position = 'absolute';
                subFormulaAutocompleteRef.current.style.top = `${rect.bottom / 2 + 10}px`;
                subFormulaAutocompleteRef.current.style.left = `${rect.left - 40}px`;
                const inputWidth = inputRef.current.offsetWidth;
                subFormulaAutocompleteRef.current.style.width = `${Math.max(inputWidth, 250)}px`;
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
                        {formulae.map((field, idx) => (
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
                            const value = e.target.value;

                            if (
                                e.key === 'Backspace'
                                && e.target.value === ''
                                && formulae.length > 0
                            ) {
                                const { operator, value } = pop()
                                e.target.value = `${operator || ''}${value || ''}`;
                            }
                            
                            if (
                                e.key === 'Enter' &&
                                /^[\+\-\*\/]\d+$/.test(value)
                            ) {
                                // Value is an operator followed by a numeric value
                                const operator = value[0];
                                const number = value.slice(1);

                                push({operatorName: operator, value: number });

                                e.target.value = '';
                                hideFormulaOptions();
                                return;
                            }
                        }}
                        onChange={e => {
                            const value = e.target.value;

                            if (/^[\+\-\*\/][a-zA-Z]/.test(value)) {
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
                                }, 200); 
                            }
                            else {
                                hideFormulaOptions()
                            }
                        }}
                    />

                </div>

                {formulaFunctions && Array.isArray(formulaFunctions) && formulaFunctions.length > 0 && (
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
                        {formulaFunctions.map((item, idx) => (
                            <div
                                key={idx}
                                className='autocomplete-item'
                            >
                                <div className="name">{item.name}</div>
                                <div className="category">{item.category}</div>
                                
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default FormulaCalculator
