import React, {FC, useMemo, useState, useEffect, ReactElement} from "react";
import {useFetch} from "../hooks/useFetch";
import {Input, Page, List} from "nacho-component-library";
import { WhitelistUpdateModal } from "../components/whitelist/WhitelistUpdateModal";
import { Button } from 'react-bootstrap';
import '../styles/WhitelistPage.css'

type WhitelistData = {
    id: string
    address: string
}

const header = ['id', 'address', 'actions']

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

    const getElement = (header: string, item: WhitelistData): ReactElement => {
        switch (header) {
            case 'id':
                return <div>{item.id}</div>;
            case 'address':
                return <div className="address-text">{item.address}</div>;
            case 'actions':
                return (
                    <Button 
                        size="sm"
                        variant="outline-primary"
                        onClick={() => setSelectedWhitelist(item)}
                    >
                        Edit
                    </Button>
                );
            default:
                return <div>{item[header as keyof WhitelistData]}</div>;
        }
    };

    const getHeader = (value: string): ReactElement => {
        switch (value) {
            case 'id':
                return <div>ID</div>;
            case 'address':
                return <div>Wallet Address</div>;
            case 'actions':
                return <div>Actions</div>;
            default:
                return <div>{value}</div>;
        }
    };

    if (loading) {
        return <div className="loading-state">Loading whitelist data...</div>;
    }

    if (!loading && (!data || data.length === 0)) {
        return <div className="empty-state">No whitelist entries found</div>;
    }

    return (
        <>
            <List 
                headerElements={header}
                items={internalData}
                itemHeight={40}
                getHeader={getHeader}
                getElement={getElement}
                isLoading={loading}
                cssGrid={true}
            />
            
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