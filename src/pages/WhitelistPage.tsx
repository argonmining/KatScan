import React, {FC, useMemo, useState} from "react";
import {useFetch} from "../hooks/useFetch";
import {CustomTabs, Input, List, Page} from "nacho-component-library";
import 'styles/WhitelistPage.css'

const titles = ['Donators', 'Contributors']

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
        <CustomTabs titles={titles}>
            <DonatorsList searchTerm={searchTerm}/>
            <ContributorsList searchTerm={searchTerm}/>
        </CustomTabs>
    </Page>

}

const donHeaders = ['address']

type ListProps = {
    searchTerm: string
}
const DonatorsList: FC<ListProps> = (
    {
        searchTerm
    }
) => {

    const {data, loading} = useFetch<WhitelistData[]>({
        url: '/whitelist/donators'
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

const conHeader = ['address']
const ContributorsList: FC<ListProps> = (
    {
        searchTerm
    }
) => {

    const {data, loading} = useFetch<WhitelistData[]>({
        url: '/whitelist/contributors'
    })

    const internalData = useMemo(() => {
        if (searchTerm === '') {
            return data
        }
        return data.filter(single => single.address.includes(searchTerm))
    }, [data, searchTerm])

    return <List headerElements={conHeader}
                 items={internalData}
                 minItemHeight={50}
                 noDataText={'No Data available'}
                 isLoading={loading}
                 showHeader={false}/>
}
export default WhitelistPage