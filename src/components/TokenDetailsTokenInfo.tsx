import React, {FC} from "react";
import {Card} from "react-bootstrap";
import {SmallThumbnail, Thumbnail} from "nacho-component-library";
import {katscanStaticUrl} from "../utils/StaticVariables";
import {formatNumber, parseRawNumber} from "../services/Helper";
import {Link} from "react-router-dom";
import {TokenData} from "../interfaces/TokenData";
import {Socials} from "../pages/TokenDetail";
import {FaImages} from "react-icons/fa6";

interface Props {
    tokenData: TokenData
    socials: Socials
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
                return <SmallThumbnail src={`${katscanStaticUrl}/twitter.svg`} alt={'twitter'}/>
            case 'discord':
                return <SmallThumbnail src={`${katscanStaticUrl}/discord.svg`} alt={'discord'}/>
            case 'telegram':
                return <SmallThumbnail src={`${katscanStaticUrl}/telegram.svg`} alt={'telegram'}/>
            default:
                if (tokenData.logo === null) {
                    return <FaImages className={'small-thumbnail-image'}/>
                }
                return <SmallThumbnail
                    src={`${katscanStaticUrl}/thumbnails${tokenData.logo}`}
                    alt={'website'}/>
        }
    }

    return <Card className="token-info-card">
        <Card.Body>
            <div className="token-info-grid">
                <div className="token-info-item-image">
                    {tokenData.logo ?
                        <Thumbnail src={`${katscanStaticUrl}/logos${tokenData.logo}`} alt={`${tokenData.tick}.jpg`}/>
                        : <FaImages className={'thumbnail-image'} style={{height:'fit-content', borderRadius: 'unset'}}/>
                    }
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
                        {Object.entries(socials).map(([type, url]) =>
                            <Link key={type} to={url} target={'_blank'} referrerPolicy={'no-referrer'} title={url}>
                                {getIcon(type)}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </Card.Body>
    </Card>
}