import React, {FC, useCallback, useEffect, useState} from 'react';
import {Col, Container, Form, Row} from 'react-bootstrap';
import {Legend, ResponsiveContainer, Tooltip, Treemap} from 'recharts';
import 'styles/MintHeatmap.css';
import {censorTicker} from '../utils/censorTicker';
import {JsonLd, LoadingSpinner, Page, sendRequest, SEO} from "nacho-component-library";
import {MintData} from "../interfaces/MintData";
import {addAlert} from "../components/alerts/Alerts";
import {katscanApiUrl} from "../utils/StaticVariables";

const timeframes = [
    {value: 'day', label: 'Last 24 Hours'},
    {value: 'week', label: 'This Week'},
    {value: 'month', label: 'This Month'},
    {value: 'year', label: 'This Year'},
    {value: 'all', label: 'All Time'},
];

type InternalMintData = {
    name: string,
    children: { name: string, size: number, actualSize: number }[]
}

type TreemapContentType = {
    root: Record<string, string | []>,
    depth: number,
    x: number,
    y: number,
    width: number,
    height: number,
    index: number,
    name: string
}
type TooltipType = { active: boolean, payload: { payload: { name: string, actualSize: number } }[] }

// todo refactor
const MintHeatmap: FC = () => {
    const [mintData, setMintData] = useState<InternalMintData[]>([]);
    const [loading, setLoading] = useState(false);
    const [timeframe, setTimeframe] = useState('week');
    const [totalMints, setTotalMints] = useState(0);

    const getStartDate = (timeframe: string): Date => {
        const now = new Date();
        switch (timeframe) {
            case 'day':
                return new Date(now.setHours(0, 0, 0, 0));
            case 'week':
                return new Date(now.setDate(now.getDate() - 7));
            case 'month':
                return new Date(now.setMonth(now.getMonth() - 1));
            case 'year':
                return new Date(now.setFullYear(now.getFullYear() - 1));
            case 'all':
                return new Date('2024-01-01T00:00:00Z');
            default:
                return new Date(now.setDate(now.getDate() - 7));
        }
    };

    const fetchMintData = useCallback(async (): Promise<void> => {
        if (!timeframe) return;
        setLoading(true);
        const startDate = getStartDate(timeframe);
        const endDate = new Date();

        try {
            const response = await sendRequest<MintData[]>({
                method: 'GET',
                url: `${katscanApiUrl}/minting/mint-totals`,
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            if (!response || !Array.isArray(response)) {
                throw new Error('Invalid response format');
            }
            if (response.length > 0) {
                const processedData = response
                    .sort((a, b) => b.mintTotal - a.mintTotal)
                    .slice(0, 100)
                    .map((item) => ({
                        name: item.tick,
                        size: Math.log(item.mintTotal + 1),
                        actualSize: item.mintTotal,
                    }));
                setMintData([{
                    name: 'tokens',
                    children: processedData
                }]);
                setTotalMints(response.reduce((sum, item) => sum + item.mintTotal, 0));
            } else {
                setMintData([{
                    name: 'tokens',
                    children: [{name: 'No data', size: 1, actualSize: 0}]
                }]);
                setTotalMints(0);
            }
        } catch (error) {
            console.error('Error fetching mint data:', error);
            addAlert('error', 'Failed to fetch mint data. Please try again later.');
            setMintData([{
                name: 'tokens',
                children: [{name: 'Error', size: 1, actualSize: 0}]
            }]);
            setTotalMints(0);
        }
        setLoading(false);
    }, [timeframe]);

    useEffect(() => {
        if (timeframe) {
            void fetchMintData();
        }
    }, [timeframe, fetchMintData]);

    //todo Refactor after ts
    const CustomTooltip = ({active, payload}: TooltipType) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.actualSize / totalMints) * 100).toFixed(2);
            return (
                <div className="custom-tooltip">
                    <p><strong>{censorTicker(data.name)}</strong></p>
                    <p>Mints: {data.actualSize.toLocaleString()}</p>
                    <p>Percentage: {percentage}%</p>
                </div>
            );
        }
        return null;
    };


    // todo refactor after ts
    const CustomTreemapContent = ({root, x, y, width, height, index, name}: TreemapContentType) => {
        const fontSize = Math.min(width / 6, height / 4, 16);
        const shortName = name && name.length > 6 ? `${name.slice(0, 5)}...` : name;

        let fillColor = 'hsl(0, 0%, 50%)';
        if (root && root.children && root.children.length > 0) {
            const colorIndex = Math.min(Math.max(index, 0), root.children.length - 1);
            fillColor = `hsl(${(1 - colorIndex / root.children.length) * 120}, 70%, 50%)`;
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
                        // eslint-disable-next-line
                        // @ts-ignore
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
        );
    };

    const CustomLegend = () => (
        <div className="custom-legend">
            <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: 'hsl(120, 70%, 50%)'}}></span>
                <span>High mint activity</span>
            </div>
            <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: 'hsl(60, 70%, 50%)'}}></span>
                <span>Medium mint activity</span>
            </div>
            <div className="legend-item">
                <span className="legend-color" style={{backgroundColor: 'hsl(0, 70%, 50%)'}}></span>
                <span>Low mint activity</span>
            </div>
        </div>
    );

    return (
        <Page header={'Token Mint Heatmap'}>
            <Container fluid className="mint-heatmap">
                <SEO
                    title="Mint Heatmap"
                    description="Visualize KRC-20 token minting activity on the Kaspa blockchain with an interactive heatmap."
                    keywords="KRC-20, Kaspa, mint heatmap, token activity, visualization"
                />
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "KatScan Mint Heatmap",
                        "description": "Visualize KRC-20 token minting activity on the Kaspa blockchain with an interactive heatmap.",
                        "url": "https://katscan.xyz/mint-heatmap"
                    }}
                />
                {/* Remove the following Alert component */}
                {/* <Alert variant="warning">
                Note: The data displayed on this page may not be accurate due to an ongoing backend service issue.
            </Alert> */}
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Timeframe</Form.Label>
                            <Form.Control
                                as="select"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                            >
                                <option value="">Select a timeframe</option>
                                {timeframes.map((tf) => (
                                    <option key={tf.value} value={tf.value}>
                                        {tf.label}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md={8}>
                        {totalMints > 0 && (
                            <p className="total-mints">Total Mints: {totalMints.toLocaleString()}</p>
                        )}
                    </Col>
                </Row>
                {!timeframe && <p>Please select a timeframe to view the mint heatmap.</p>}
                {loading && <LoadingSpinner useFlexHeight={true}/>}
                {timeframe && mintData.length > 0 && (
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={mintData}
                                dataKey="size"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                // eslint-disable-next-line
                                //@ts-ignore
                                content={<CustomTreemapContent/>}
                                animationDuration={500}
                                animationEasing="ease-in-out"
                            >
                                {/* eslint-disable-next-line*/}
                                {/*@ts-ignore*/}
                                <Tooltip content={<CustomTooltip/>}/>
                                <Legend content={<CustomLegend/>}/>
                            </Treemap>
                        </ResponsiveContainer>
                    </div>
                )}
                {timeframe && mintData.length === 0 && (
                    <p>No mint data available for the selected timeframe.</p>
                )}
            </Container>
        </Page>
    );
};

export default MintHeatmap;