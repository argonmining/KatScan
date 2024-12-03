import React, {FC, FormEvent, MouseEvent, ReactElement, useCallback, useMemo, useRef, useState} from "react";
import {debounce} from "lodash";
import './CustomSelect.css'
import {FaChevronDown, FaX} from "react-icons/fa6";
import {CustomDropdown, CustomDropdownItem, DropdownRef} from "nacho-component-library";

export type Selection = { value: string | number, label: string } & Record<string, unknown>
type Props = {
    data: Selection[]
    hasSearch: boolean
    onSelect: (value: Selection) => void
    placeholder?: string
}

export const CustomSelect: FC<Props> = (
    {
        data,
        hasSearch,
        onSelect,
        placeholder
    }
) => {
    const searchRef = useRef<HTMLDivElement | null>(null)
    const [search, setSearch] = useState<string>('')
    const [canClose, setCanClose] = useState(false)
    const dropdownRef = useRef<DropdownRef>(null)

    const changeDebounced = debounce((value: string) => setSearch(value), 10)

    const clickCloseIcon = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
        e.preventDefault()
        setCanClose(false)
        dropdownRef.current?.close()
    }

    const input = useMemo((): ReactElement => {
        return <>
            <input type={'text'}
                   className={'search-input'}
                   placeholder={placeholder}
                   onChange={hasSearch ? (e: FormEvent<HTMLInputElement>) => changeDebounced(e.currentTarget.value) : undefined}
                   value={search}/>
            <div className={'search-icon-wrapper'}>
                {search !== '' &&
                    <div className={'search-reset-wrapper'}
                         onClick={() => setSearch('')}>
                        <FaX size={15}/>
                    </div>
                }
                <div className={'search-arrow-wrapper'}
                     onClick={canClose ? clickCloseIcon : undefined}>
                    <FaChevronDown className={'search-arrow'} size={15}/>
                </div>
            </div>
        </>
    }, [canClose, changeDebounced, hasSearch, placeholder, search])

    const internalData = useMemo(() => {
        if (hasSearch && search !== '') {
            return data.filter(single => single.label.toUpperCase().includes(search.toUpperCase()))
        }
        return data
    }, [data, hasSearch, search])

    const onSelectInternal = (e: MouseEvent<HTMLDivElement>, selection: Selection) => {
        e.preventDefault()
        e.stopPropagation()
        setSearch(selection.label)
        onSelect(selection)
        dropdownRef.current?.close()
        console.log(selection)
    }

    const onOpen = useCallback(() => setCanClose(true), [])

    return <div ref={searchRef} className={'custom-search-select'}>
        <CustomDropdown title={input}
                        stayOpen={true}
                        fitHeader={true}
                        onOpen={onOpen}
                        className={'select-custom-dropdown'}
                        ref={dropdownRef}>
            {internalData.map((single, index) =>
                <CustomDropdownItem key={index}
                                    onClick={(e) => onSelectInternal(e, single)}>
                    {single.label}
                </CustomDropdownItem>)}
            {internalData.length === 0 && <div className={'no-data'}>No Data</div>}
        </CustomDropdown>
    </div>
}