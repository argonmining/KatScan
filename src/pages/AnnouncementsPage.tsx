import React, {FC, useState} from "react";
import {useFetch} from "../hooks/useFetch";
import {List, Page} from "nacho-component-library";
import {Announcements} from "../components/announcements/Announcements";
import 'styles/AnnouncementsPage.css'

const sort: [string, "desc" | "asc"] = ['timestamp', 'desc']
const header = ['title', 'timestamp']

const AnnouncementsPage: FC = () => {

    const [announcement, setAnnouncement] = useState<Announcement>()
    const {data, loading} = useFetch<Announcement[]>({
        url: '/announcements/all',
        sort: sort
    })

    return <Page header={"Announcements"} className={'announcements-page'}>
        <List headerElements={header}
              items={data}
              minItemHeight={50}
              noDataText={'No Announcements available'}
              isLoading={loading}
              onClickRow={setAnnouncement}
              showHeader={false}/>
        {announcement && <Announcements announcement={announcement} onClose={() => setAnnouncement(undefined)}/>}
    </Page>

}

export default AnnouncementsPage