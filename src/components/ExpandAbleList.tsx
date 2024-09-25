import React, {ReactElement, useState} from "react";
import {Button, Table, TableProps} from "react-bootstrap";
import {FaChevronDown, FaChevronUp} from "react-icons/fa";
import {debounce} from "chart.js/helpers";
import {LoadingSpinner} from "./LoadingSpinner";

type Props<T> = {
    isLoading?: boolean
    headEntries: string[]
    entries: T[]
    getRowData: (data: T, index: number) => ReactElement
    getExpandData: (data: T, index: number) => ReactElement
    props?: TableProps
}

export const ExpandAbleList = <T extends Record<string, unknown>>(
    {
        isLoading,
        headEntries,
        entries,
        getRowData,
        getExpandData,
        props
    }: Props<T>
): ReactElement => {
    return <Table {...props}>
        <thead>
        <tr>
            {headEntries.map(single => <th key={single}>{single}</th>)}
        </tr>
        </thead>
        <tbody>
        {isLoading && <tr>
            <td colSpan={4}><LoadingSpinner/></td>
        </tr>}
        {entries.map((single, index) => <ExpandAbleRow key={index} entry={single} index={index} getRowData={getRowData}
                                                       getExpandData={getExpandData}/>)}
        </tbody>
    </Table>
}

type ExpandAbleRow<T> = {
    entry: T
    index: number
    getRowData: (data: T, index: number) => ReactElement
    getExpandData: (data: T, index: number) => ReactElement
}
const ExpandAbleRow = <T extends Record<string, unknown>>(
    {
        entry,
        index,
        getRowData,
        getExpandData
    }: ExpandAbleRow<T>
): ReactElement => {
    const [isExpanded, setIsExpanded] = useState(false)

    const changeView = debounce(() => setIsExpanded(current => !current), 10)

    return <>
        <tr>
            {getRowData(entry, index)}
            <td>
                <Button
                    variant="link"
                    onClick={changeView}
                    aria-expanded={isExpanded}
                >
                    {isExpanded ? 'Hide Tokens' : 'Show Tokens'}
                    {isExpanded ? <FaChevronUp className="ml-1"/> :
                        <FaChevronDown className="ml-1"/>}
                </Button>
            </td>
        </tr>
        {isExpanded && <tr>{getExpandData(entry, index)}</tr>}
    </>
}