import React, {FC, useMemo, useState} from "react";
import {useFetch} from "../hooks/useFetch";
import {Input, List, Page} from "nacho-component-library";
import 'styles/WhitelistPage.css'

type WhitelistData = {
    address: string
}

const WhitelistPage: FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    return <Page header={"Whitelist"}
                 className={'whitelists-page'}
                 additionalHeaderComponent={
                     <Input customClass={'whitelist-search-form'}
                            placeholder={'Search for Address...'}
                            onChangeCallback={setSearchTerm}
                            onSubmit={setSearchTerm}/>
                 }>
        <Whitelist searchTerm={searchTerm}/>
    </Page>

}

const donHeaders = ['address']

type ListProps = {
    searchTerm: string
}
const Whitelist: FC<ListProps> = (
    {
        searchTerm
    }
) => {

    const {data, loading} = useFetch<WhitelistData[]>({
        url: '/whitelist'
    })

    const internalData = useMemo(() => {
        if (searchTerm === '') {
            return data
        }
        return data.filter(single => single.address.includes(searchTerm))
    }, [data, searchTerm])

    return <List headerElements={donHeaders}
                 items={internalData}
                 minItemHeight={50}
                 noDataText={'No Data available'}
                 isLoading={loading}
                 showHeader={false}/>
}

export default WhitelistPage