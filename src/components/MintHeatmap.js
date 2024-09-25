import React, { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Form, Alert } from 'react-bootstrap'
import { ResponsiveContainer, Treemap, Tooltip, Legend } from 'recharts'
import axios from 'axios'
import '../styles/MintHeatmap.css'
import PropTypes from 'prop-types'
import { censorTicker } from '../utils/censorTicker'
import SEO from './SEO'
import JsonLd from './JsonLd'
import { LoadingSpinner } from './LoadingSpinner'

const timeframes = [
    { value: 'day', label: 'Last 24 Hours' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' },
]

const MintHeatmap = () => {
    const [mintData, setMintData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [timeframe, setTimeframe] = useState('')
    const [totalMints, setTotalMints] = useState(0)

    const getStartDate = timeframe => {
        const now = new Date()
        switch (timeframe) {
            case 'day':
                return new Date(now.setHours(0, 0, 0, 0))
            case 'week':
                return new Date(now.setDate(now.getDate() - 7))
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1))
            case 'year':
                return new Date(now.setFullYear(now.getFullYear() - 1))
            case 'all':
                return new Date('2024-01-01T00:00:00Z')
            default:
                return new Date(now.setDate(now.getDate() - 7))
        }
    }

    const fetchMintData = useCallback(async () => {
        if (!timeframe) return
        setLoading(true)
        setError(null)
        const startDate = getStartDate(timeframe)
        const endDate = new Date()

        try {
            const response = await axios.get(
                'https://katapi.nachowyborski.xyz/api/mint-totals',
                {
                    params: {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                    },
                },
            )
            if (!response.data || !Array.isArray(response.data)) {
                throw new Error('Invalid response format')
            }
            if (response.data.length > 0) {
                const processedData = response.data
                    .sort((a, b) => b.mintTotal - a.mintTotal)
                    .slice(0, 100)
                    .map(item => ({
                        name: item.tick,
                        size: Math.log(item.mintTotal + 1),
                        actualSize: item.mintTotal,
                    }))
                setMintData([
                    {
                        name: 'tokens',
                        children: processedData,
                    },
                ])
                setTotalMints(
                    response.data.reduce(
                        (sum, item) => sum + item.mintTotal,
                        0,
                    ),
                )
            } else {
                setMintData([
                    {
                        name: 'tokens',
                        children: [{ name: 'No data', size: 1, actualSize: 0 }],
                    },
                ])
                setTotalMints(0)
            }
        } catch (error) {
            console.error('Error fetching mint data:', error)
            setError('Failed to fetch mint data. Please try again later.')
            setMintData([
                {
                    name: 'tokens',
                    children: [{ name: 'Error', size: 1, actualSize: 0 }],
                },
            ])
            setTotalMints(0)
        }
        setLoading(false)
    }, [timeframe])

    useEffect(() => {
        if (timeframe) {
            fetchMintData()
        }
    }, [timeframe, fetchMintData])

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            const percentage = ((data.actualSize / totalMints) * 100).toFixed(2)
            return (
                <div className="custom-tooltip">
                    <p>
                        <strong>{censorTicker(data.name)}</strong>
                    </p>
                    <p>Mints: {data.actualSize.toLocaleString()}</p>
                    <p>Percentage: {percentage}%</p>
                </div>
            )
        }
        return null
    }

    const CustomTreemapContent = ({
        root,
        depth,
        x,
        y,
        width,
        height,
        index,
        name,
    }) => {
        const fontSize = Math.min(width / 6, height / 4, 16)
        const shortName =
            name && name.length > 6 ? `${name.slice(0, 5)}...` : name

        let fillColor = 'hsl(0, 0%, 50%)'
        if (root && root.children && root.children.length > 0) {
            const colorIndex = Math.min(
                Math.max(index, 0),
                root.children.length - 1,
            )
            fillColor = `hsl(${
                (1 - colorIndex / root.children.length) * 120
            }, 70%, 50%)`
        }

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: fillColor,
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 1,
                        rx: 4,
                        ry: 4,
                    }}
                />
                {width > 30 && height > 30 && shortName && (
                    <text
                        x={x + width / 2}
                        y={y + height / 2}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize={fontSize}
                    >
                        {shortName}
                    </text>
                )}
            </g>
        )
    }

    const CustomLegend = () => (
        <div className="custom-legend">
            <div className="legend-item">
                <span
                    className="legend-color"
                    style={{ backgroundColor: 'hsl(120, 70%, 50%)' }}
                ></span>
                <span>High mint activity</span>
            </div>
            <div className="legend-item">
                <span
                    className="legend-color"
                    style={{ backgroundColor: 'hsl(60, 70%, 50%)' }}
                ></span>
                <span>Medium mint activity</span>
            </div>
            <div className="legend-item">
                <span
                    className="legend-color"
                    style={{ backgroundColor: 'hsl(0, 70%, 50%)' }}
                ></span>
                <span>Low mint activity</span>
            </div>
        </div>
    )

    CustomTooltip.propTypes = {
        active: PropTypes.bool,
        payload: PropTypes.array,
    }

    CustomTreemapContent.propTypes = {
        root: PropTypes.object,
        depth: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        index: PropTypes.number,
        name: PropTypes.string,
    }

    return (
        <Container fluid className="mint-heatmap">
            <SEO
                title="Mint Heatmap"
                description="Visualize KRC-20 token minting activity on the Kaspa blockchain with an interactive heatmap."
                keywords="KRC-20, Kaspa, mint heatmap, token activity, visualization"
            />
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'WebApplication',
                    name: 'KatScan Mint Heatmap',
                    description:
                        'Visualize KRC-20 token minting activity on the Kaspa blockchain with an interactive heatmap.',
                    url: 'https://katscan.xyz/mint-heatmap',
                }}
            />
            <h1 style={{ color: `var(--primary-color)` }}>
                Token Mint Heatmap
            </h1>
            <Alert variant="warning">
                Note: The data displayed on this page may not be accurate due to
                an ongoing backend service issue.
            </Alert>
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>Timeframe</Form.Label>
                        <Form.Control
                            as="select"
                            value={timeframe}
                            onChange={e => setTimeframe(e.target.value)}
                        >
                            <option value="">Select a timeframe</option>
                            {timeframes.map(tf => (
                                <option key={tf.value} value={tf.value}>
                                    {tf.label}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col md={8}>
                    {totalMints > 0 && (
                        <p className="total-mints">
                            Total Mints: {totalMints.toLocaleString()}
                        </p>
                    )}
                </Col>
            </Row>
            {!timeframe && (
                <p>Please select a timeframe to view the mint heatmap.</p>
            )}
            {error && <p className="text-danger">{error}</p>}
            {loading && <LoadingSpinner useFlexHeight={true} />}
            {timeframe && mintData.length > 0 && (
                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={mintData}
                            dataKey="size"
                            ratio={4 / 3}
                            stroke="#fff"
                            content={<CustomTreemapContent />}
                            animationDuration={500}
                            animationEasing="ease-in-out"
                        >
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>
            )}
            {timeframe && mintData.length === 0 && (
                <p>No mint data available for the selected timeframe.</p>
            )}
        </Container>
    )
}

export default MintHeatmap
