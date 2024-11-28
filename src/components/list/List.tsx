import React, {ReactElement, UIEvent, useCallback, useMemo, useRef, useState} from "react";
import './List.css'
import {LoadingSpinner} from "nacho-component-library";

type Props<T> = {
    headerElements: string[]
    getHeader?: (header: string) => ReactElement | null
    items: T[]
    itemHeight: number,
    gridTemplate?: number[]
    getRow?: (item: T) => ReactElement
    getElement?: (header: string | Partial<keyof T>, item: T) => ReactElement
    isLoading?: boolean
    cssGrid?: boolean
}
const puffer = 10
export const List = <T extends Record<string, unknown> & { id: string }>(
    {
        headerElements,
        getHeader,
        items,
        itemHeight,
        gridTemplate,
        getRow,
        getElement,
        isLoading,
        cssGrid
    }: Props<T>
): ReactElement => {

    const containerRef = useRef<HTMLDivElement | null>(null)
    const headerRef = useRef<HTMLDivElement | null>(null)

    const [scrollTop, setScrollTop] = useState(0);

    const startIndex = Math.max(
        Math.floor(scrollTop / itemHeight) - puffer, 0);

    const endIndex = Math.min(
        startIndex + Math.ceil((scrollTop + (containerRef?.current?.clientHeight ?? 200)) / itemHeight) + puffer,
        items.length - 1
    )

    const visibleItems = items.slice(startIndex, endIndex + 1);

    const gridTemplateInternal = useMemo(() => {
        if (cssGrid) {
            return
        }
        if (gridTemplate) {

            return gridTemplate.map(single => `${single}px`).join(" ")
        }
        return headerElements.map(() => '1fr').join(" ")
    }, [cssGrid, gridTemplate, headerElements])

    const handleScroll = (e: UIEvent<HTMLDivElement>): void => {
        if (e.currentTarget?.scrollTop !== 0) {
            setScrollTop(e.currentTarget?.scrollTop)
        }
        if (e.currentTarget?.scrollLeft !== 0) {
            headerRef.current?.scrollTo(e.currentTarget?.scrollLeft, 0)
        }
    }
    const handleScrollHeader = (e: UIEvent<HTMLDivElement>): void => {
        containerRef.current?.scrollTo(e.currentTarget?.scrollLeft, scrollTop)
    }

    const getHeaderInternal = useCallback((value: string): ReactElement => {
        if (getHeader) {
            return <div key={value} className={`header-item ${value}`}>{getHeader(value)}</div>
        }
        return <div key={value} className={`header-item ${value}`}>{value}</div>

    }, [getHeader])
    const Row = (index: number, item: T): ReactElement => {
        if (getRow) {
            return getRow(item)
        }

        return <div key={item.id} className={'list-item'}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: gridTemplateInternal,
                        height: itemHeight,
                        position: "absolute",
                        top: (startIndex + index) * itemHeight + index,
                        left: 0,
                        right: 0,
                    }}>
            {headerElements.map(single => getElement
                ? <div key={`${single}`} style={{height: itemHeight}}
                       className={`list-column ${single}`}>{getElement(single, item)}</div>
                : <div key={`${single}`} style={{height: itemHeight}}
                       className={`list-column ${single}`}>{item[single] as string}</div>)}
        </div>
    }

    return <div className={'list'}>
        <div ref={headerRef} onScroll={handleScrollHeader} className={'list-header'}
             style={{gridTemplateColumns: gridTemplateInternal}}>
            {headerElements.map(getHeaderInternal)}
        </div>
        <div onScroll={handleScroll}
             className={'list-body'}
             ref={containerRef}
             style={{
                 height: `calc(100% - ${(headerRef?.current?.clientHeight ?? 200) + (isLoading ? itemHeight : 0)}px)`
             }}>

            {visibleItems.map((single, index) => Row(index, single))}
            {visibleItems.length === 0 && !isLoading && (
                <span className="text-center">
                    {'No tokens to display'}
                </span>
            )}
        </div>
        {isLoading ? <div style={{height: itemHeight}}><LoadingSpinner/></div> : null}
    </div>
}