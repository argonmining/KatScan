import React, {FC, useEffect, useState} from "react";
import {useFetch} from "../../hooks/useFetch";
import {Carousel, Modal} from "react-bootstrap";
import {Image, useDarkMode} from "nacho-component-library";
import {katscanStaticUrl} from "../../utils/StaticVariables";
import './Announcements.css'

export const Announcements: FC = () => {
    const {isDarkMode} = useDarkMode()
    const [show, setShow] = useState(false)


    const {data} = useFetch<Announcement[]>({
        url: '/announcements/all'
    })

    useEffect(() => {
        if (!data) {
            return
        }
        setShow(true)
    }, [data]);

    if (!data) {
        return null
    }

    const onHide = () => {
        setShow(false)
        console.log('hide')
    }
    return <Modal
        show={show}
        onHide={onHide}
        centered
        className={'announcements-modal modal-lg'}
    >
        <Modal.Header closeButton data-bs-theme={isDarkMode ? 'dark' : 'light'}>
            <Modal.Title>Announcements</Modal.Title>
        </Modal.Header>
        <Carousel slide={true}
                  interval={null}
                  controls={true}
                  indicators={true}>
            {data.map(single =>
                <Carousel.Item key={single.id}>
                    <Announcement key={single.id} id={single.id}
                                  title={single.title}
                                  imageUrl={single.imageUrl}
                                  text={single.text}/>
                </Carousel.Item>
            )}
        </Carousel>
    </Modal>
}


const Announcement: FC<Announcement> = (
    {
        title,
        text,
        imageUrl
    }
) => {

    return <div className={'announcement'}>
        <h3 className={'title'}>{title}</h3>
        <p className={'text'}>{text}</p>
        {imageUrl && <Image src={`${katscanStaticUrl}${imageUrl}`} alt={title}/>}
    </div>
}