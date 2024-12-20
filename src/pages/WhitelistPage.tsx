import React, {FC} from "react";
import {useFetch} from "../hooks/useFetch";
import 'styles/AnnouncementsPage.css'
import {CustomTabs, List, Page} from "nacho-component-library";

const titles = ['Donators', 'Contributors']

const AnnouncementsPage: FC = () => {

    return <Page header={"Whitelist"} className={'whitelists-page'}>
        <CustomTabs titles={titles}>
            <DonatorsList/>
            <ContributorsList/>
        </CustomTabs>
    </Page>

}

const donHeaders = ['address']
const DonatorsList: FC = () => {

    const {data, loading} = useFetch<Announcement[]>({
        url: '/whitelist/donators'
    })

    return <List headerElements={donHeaders}
                 items={data}
                 minItemHeight={50}
                 noDataText={'No Data available'}
                 isLoading={loading}
                 showHeader={false}/>
}

const conHeader = ['address']
const ContributorsList: FC = () => {

    const {data, loading} = useFetch<Announcement[]>({
        url: '/whitelist/contributors'
    })

    return <List headerElements={conHeader}
                 items={data}
                 minItemHeight={50}
                 noDataText={'No Data available'}
                 isLoading={loading}
                 showHeader={false}/>
}
export default AnnouncementsPage