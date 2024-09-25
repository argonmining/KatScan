import { Card, Col } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import React, { FC, ReactNode } from 'react'

type BaseCardType = {
    title: string
    icon: ReactNode
}

type FeatureCard = BaseCardType & {
    link: string
}
export const FeatureCard: FC<FeatureCard> = ({ title, icon, link }) => (
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
export const StatCard: FC<StatCard> = ({ title, value, icon }) => (
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
    children: ReactNode
}
export const NormalCard: FC<NormalCard> = ({ title, children }) => {
    return (
        <Card>
            <Card.Body>
                <Card.Title>{title}</Card.Title>
                <Card.Text>{children}</Card.Text>
            </Card.Body>
        </Card>
    )
}
