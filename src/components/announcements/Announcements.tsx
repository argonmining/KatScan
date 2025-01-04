import React, {FC, useEffect, useState} from "react";
import {useFetch} from "../../hooks/useFetch";
import {Carousel, Modal} from "react-bootstrap";
import {Image, useDarkMode} from "nacho-component-library";
import {katscanStaticUrl} from "../../utils/StaticVariables";
import './Announcements.css'
import {openLink} from "../../services/Helper";

type Props = {
    announcement?: Announcement
    onClose?: () => void
}
export const Announcements: FC<Props> = (
    {
        announcement,
        onClose
    }
) => {
    const {isDarkMode} = useDarkMode()
    const [show, setShow] = useState(false)
    const [internalIds, setInternalIds] = useState<number[]>([])
    const [internalData, setInternalData] = useState<Announcement[] | undefined>()
    const {data} = useFetch<Announcement[]>({
        url: '/announcements',
        avoidLoading: announcement !== undefined
    })

    useEffect(() => {
        if (!data || data.length === 0) {
            return
        }
        let ids = JSON.parse(localStorage.getItem('announcementIds') ?? '[]') as number[]
        const filtered = data.filter(single => !ids.includes(single.id))
        //set to the announcements in the db
        ids = data.map(single => single.id)
        if (filtered.length !== 0) {
            setInternalData(filtered)
            setInternalIds((ids))
            setShow(true)
        }
    }, [data]);

    useEffect(() => {
        if (!announcement) {
            return
        }
        setInternalData([announcement])
        setShow(true)
    }, [announcement]);

    if (!internalData || internalData.length === 0) {
        return null
    }

    const onHide = () => {
        localStorage.setItem('announcementIds', JSON.stringify(internalIds))
        setShow(false)
    }
    return <Modal
        show={show}
        onHide={onClose ?? onHide}
        centered
        className={'announcements-modal modal-lg'}
    >
        <Modal.Header closeButton data-bs-theme={isDarkMode ? 'dark' : 'light'}>
            <Modal.Title>Announcements</Modal.Title>
        </Modal.Header>
        <Carousel slide={true}
                  interval={null}
                  controls={internalData.length > 1}
                  indicators={true}>
            {internalData.map(single =>
                <Carousel.Item key={single.id}>
                    <Announcement key={single.id}
                                  {...single} />
                </Carousel.Item>
            )}
        </Carousel>
    </Modal>
}


const Announcement: FC<Announcement> = (
    {
        title,
        text,
        imageurl,
        link
    }
) => {
    return <div className={'announcement'}>
        <h3 className={'title'}>{title}</h3>
        <p className={'text'}>{text}</p>
        {imageurl &&
            <div className={`image-wrapper ${link ? 'hover' : ''}`}
                 onClick={link ? () => openLink(link) : undefined}>
                <Image src={`${katscanStaticUrl}${imageurl}`} alt={title}/>
            </div>
        }
    </div>
}