import React, {FC} from "react";
import {Card} from "react-bootstrap";
import {SmallThumbnail, Thumbnail} from "nacho-component-library";
import {iconBaseUrl} from "../utils/StaticVariables";
import {formatNumber, parseRawNumber} from "../services/Helper";
import {Link} from "react-router-dom";
import {TokenSearchResult} from "../interfaces/TokenData";
import {Socials} from "../pages/TokenDetail";

interface Props {
    tokenData: TokenSearchResult
    socials: Socials[]
}

export const TokenDetailsTokenInfo: FC<Props> = (
    {
        tokenData,
        socials
    }
) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'twitter':
                return <SmallThumbnail src={"https://kas.fyi/media/svg/brand-logos/twitter.svg"} alt={'twitter'}/>
            case 'discord':
                return <SmallThumbnail src={"https://kas.fyi/media/svg/brand-logos/discord.svg"} alt={'discord'}/>
            case 'telegram':
                return <SmallThumbnail src={"https://kas.fyi/media/svg/brand-logos/telegram.svg"} alt={'telegram'}/>
            default:
                return <SmallThumbnail src={`${iconBaseUrl}${tokenData.tick}.jpg`} alt={'website'}/>
        }
    }

    return <Card className="token-info-card">
        <Card.Body>
            <div className="token-info-grid">
                <div className="token-info-item-image">
                    <Thumbnail src={`${iconBaseUrl}${tokenData.tick}.jpg`} alt={`${tokenData.tick}.jpg`}/>
                </div>
                <div className="token-info-item">
                    <span className="token-info-label">Max Supply</span>
                    <span
                        className="token-info-value">{formatNumber(parseRawNumber(tokenData.max, tokenData.dec), tokenData.dec)}</span>
                </div>
                <div className="token-info-item">
                    <span className="token-info-label">Total Minted</span>
                    <span
                        className="token-info-value">{formatNumber(parseRawNumber(tokenData.minted, tokenData.dec), tokenData.dec)}</span>
                </div>
                <div className="token-info-item">
                    <span className="token-info-label">Limit per Mint</span>
                    <span
                        className="token-info-value">{formatNumber(parseRawNumber(tokenData.lim, tokenData.dec), tokenData.dec)}</span>
                </div>
                <div className="token-info-item">
                    <span className="token-info-label">Total Mints</span>
                    <span className="token-info-value">{formatNumber(tokenData.mintTotal, 0)}</span>
                </div>
                <div className="token-info-item">
                    <span className="token-info-label">Total Holders</span>
                    <span className="token-info-value">{formatNumber(tokenData.holderTotal, 0)}</span>
                </div>
                <div className="token-info-item">
                    <span className="token-info-label">Total Transfers</span>
                    <span className="token-info-value">{formatNumber(tokenData.transferTotal, 0)}</span>
                </div>
                <div className="token-info-socials">
                    <span className="token-info-label">Socials</span>
                    <div className={'token-info-socials-wrapper'}>
                        {socials.map(single =>
                            <Link key={single.type} to={single.url}>
                                {getIcon(single.type)}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </Card.Body>
    </Card>
}