import {Button, Card, CardProps, CardTextProps, CardTitleProps, Col} from "react-bootstrap";
import {Link} from "react-router-dom";
import React, {Children, FC, PropsWithChildren, ReactNode, useState} from "react";
import {FaChevronDown, FaChevronUp} from "react-icons/fa";
import {debounce} from "chart.js/helpers";

type BaseCardType = {
    title: string
    icon: ReactNode
}

type FeatureCard = BaseCardType & {
    link: string
}
export const FeatureCard: FC<FeatureCard> = ({title, icon, link}) => (
    <Col xs={4} className="mb-2">
        <Card className="feature-card h-100" as={Link} to={link}>
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                {icon}
                <Card.Title className="mt-1 text-center small">
                    {title}
                </Card.Title>
            </Card.Body>
        </Card>
    </Col>
)

type StatCard = BaseCardType & {
    value: string
}
export const StatCard: FC<StatCard> = ({title, value, icon}) => (
    <Col xs={12} md={4} className="mb-2">
        <Card className="stat-card h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                {icon}
                <h3 className="mt-1 mb-0">{value}</h3>
                <Card.Text className="text-center small">{title}</Card.Text>
            </Card.Body>
        </Card>
    </Col>
)

type NormalCard = {
    title: string
    titleProps?: CardTitleProps
    textProps?: CardTextProps
    children: ReactNode
}
export const NormalCard: FC<NormalCard> = (
    {
        title,
        titleProps,
        textProps,
        children
    }
) => {
    return (
        <Card>
            <Card.Body>
                <Card.Title {...titleProps}>{title}</Card.Title>
                <Card.Text as={'div'} {...textProps}>{children}</Card.Text>
            </Card.Body>
        </Card>
    )
}

export const CollapseAbleCard: FC<PropsWithChildren<CardProps>> = ({children, ...props}) => {

    const [isCollapsed, setIsCollapsed] = useState(false)

    const changeView = debounce(() => setIsCollapsed(current => !current), 50)

    return <Card {...props}>
        <Card.Body>
            {Children.toArray(children)[0]}
            <Button
                variant="link"
                onClick={changeView}
                aria-expanded={!isCollapsed}
                className="mt-2 p-0"
            >
                {isCollapsed
                    ? 'Show Tokens'
                    : 'Hide Tokens'}
                {isCollapsed
                    ? <FaChevronDown className="ml-1"/>
                    : <FaChevronUp className="ml-1"/>}
            </Button>
            {!isCollapsed && Children.toArray(children)[1]}
        </Card.Body>
    </Card>
}
export const ExpandableCard: FC<PropsWithChildren<CardProps>> = ({children, ...props}) => {

    const [isExpanded, setIsExpanded] = useState(false)

    const changeView = debounce(() => setIsExpanded(current => !current), 50)

    return <Card {...props}>
        <Card.Body>
            {Children.toArray(children)[0]}
            <Button
                variant="link"
                onClick={changeView}
                aria-expanded={isExpanded}
                className="mt-2 p-0"
            >
                {isExpanded
                    ? 'Show Tokens'
                    : 'Hide Tokens'}
                {isExpanded
                    ? <FaChevronDown className="ml-1"/>
                    : <FaChevronUp className="ml-1"/>}
            </Button>
            {isExpanded && Children.toArray(children)[1]}
        </Card.Body>
    </Card>
}