import React, {FC, useMemo, useState, useEffect} from "react";
import {useFetch} from "../hooks/useFetch";
import {Input, Page} from "nacho-component-library";
import { WhitelistUpdateModal } from "../components/whitelist/WhitelistUpdateModal";
import { Button } from 'react-bootstrap';
import '../styles/WhitelistPage.css'

type WhitelistData = {
    id: string
    address: string
}

const WhitelistPage: FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    
    return (
        <Page 
            header="Nacho Kats Whitelist"
            additionalHeaderComponent={
                <Input 
                    customClass={'whitelist-search-form'}
                    placeholder={'Search by wallet address...'}
                    onChangeCallback={setSearchTerm}
                    onSubmit={setSearchTerm}
                />
            }
        >
            <div className={'whitelists-page'}>
                <Whitelist searchTerm={searchTerm} />
            </div>
        </Page>
    );
}

type ListProps = {
    searchTerm: string
}

const Whitelist: FC<ListProps> = ({searchTerm}) => {
    const [selectedWhitelist, setSelectedWhitelist] = useState<WhitelistData | null>(null);
    const [initialLoadDone, setInitialLoadDone] = useState(false);
    
    const {data, loading} = useFetch<WhitelistData[]>({
        url: '/whitelist',
        avoidLoading: initialLoadDone,
        sort: ['id', 'asc']
    });

    useEffect(() => {
        if (data && !initialLoadDone) {
            setInitialLoadDone(true);
        }
    }, [data, initialLoadDone]);

    const internalData = useMemo(() => {
        if (!data) return [];
        if (searchTerm === '') {
            return data;
        }
        return data.filter(single => single.address.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [data, searchTerm]);

    if (loading) {
        return <div className="loading-state">Loading whitelist data...</div>;
    }

    if (!loading && (!data || data.length === 0)) {
        return <div className="empty-state">No whitelist entries found</div>;
    }

    return (
        <>
            <div className="list-container">
                <div className="list-header">
                    <div className="header-cell id">ID</div>
                    <div className="header-cell address">Wallet Address</div>
                    <div className="header-cell actions">Actions</div>
                </div>
                <div className="list-body">
                    {internalData.map((item) => (
                        <div key={item.id} className="list-row">
                            <div className="list-cell id">{item.id}</div>
                            <div className="list-cell address">
                                <span className="address-text">{item.address}</span>
                            </div>
                            <div className="list-cell actions">
                                <Button 
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() => setSelectedWhitelist(item)}
                                >
                                    Edit
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {selectedWhitelist && (
                <WhitelistUpdateModal
                    show={true}
                    onClose={() => setSelectedWhitelist(null)}
                    whitelistData={selectedWhitelist}
                    onSuccess={() => {
                        setSelectedWhitelist(null);
                    }}
                />
            )}
        </>
    );
};

export default WhitelistPage;