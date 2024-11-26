import React, {FC} from "react";

import nacho from '../assets/underMaintenance.png'
import {Image} from "nacho-component-library";

export const UnderMaintenance: FC = () => {
    return <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h3 style={{color: '#70c7ba', maxWidth: '60%', textAlign: 'center'}}>
            Scratching our way to a purr-fect website!
        </h3>
        <Image src={nacho as string} alt={'under maintenance'} style={{borderRadius: '10px', width: '60%'}}/>
    </div>
}