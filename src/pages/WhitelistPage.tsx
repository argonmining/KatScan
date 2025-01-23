import React, {FC, useMemo, useState, useEffect} from "react";
import {useFetch} from "../hooks/useFetch";
import {Input, List, Page} from "nacho-component-library";
import { WhitelistUpdateModal } from "../components/whitelist/WhitelistUpdateModal";
import { Button } from 'react-bootstrap';
import 'styles/WhitelistPage.css'

type WhitelistData = {
    id: string
    address: string
}

const WhitelistPage: FC = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [shouldRefetch, setShouldRefetch] = useState(false)
    return <Page header="Whitelist"
                 additionalHeaderComponent={
                     <Input customClass={'whitelist-search-form'}
                            placeholder={'Search for Address...'}
                            onChangeCallback={setSearchTerm}
                            onSubmit={setSearchTerm}/>
                 }>
        <div className={'whitelists-page'}>
            <Whitelist 
                searchTerm={searchTerm} 
                shouldRefetch={shouldRefetch} 
                onRefetchComplete={() => setShouldRefetch(false)}
                onUpdateSuccess={() => setShouldRefetch(true)}
            />
        </div>
    </Page>
}

const donHeaders = ['address', 'actions']

type ListProps = {
    searchTerm: string
    shouldRefetch: boolean
    onRefetchComplete: () => void
    onUpdateSuccess: () => void
}

const Whitelist: FC<ListProps> = ({searchTerm, shouldRefetch, onRefetchComplete, onUpdateSuccess}) => {
    const [selectedWhitelist, setSelectedWhitelist] = useState<WhitelistData | null>(null);
    const {data, loading} = useFetch<WhitelistData[]>({
        url: '/whitelist',
        avoidLoading: false,
        sort: ['id', 'asc']
    });

    useEffect(() => {
        if (shouldRefetch) {
            onRefetchComplete();
        }
    }, [shouldRefetch, onRefetchComplete]);

    const internalData = useMemo(() => {
        if (!data) return [];
        if (searchTerm === '') {
            return data;
        }
        return data.filter(single => single.address.includes(searchTerm));
    }, [data, searchTerm]);

    const renderItem = (item: WhitelistData): Record<string, unknown> & { id: string } => ({
        ...item,
        actions: (
            <Button 
                size="sm"
                variant="outline-primary"
                onClick={() => setSelectedWhitelist(item)}
            >
                Edit
            </Button>
        )
    });

    return (
        <>
            <List 
                headerElements={donHeaders}
                items={internalData.map(renderItem)}
                itemHeight={50}
                isLoading={loading}
            />
            
            {selectedWhitelist && (
                <WhitelistUpdateModal
                    show={true}
                    onClose={() => setSelectedWhitelist(null)}
                    whitelistData={selectedWhitelist}
                    onSuccess={() => {
                        onUpdateSuccess();
                        setSelectedWhitelist(null);
                    }}
                />
            )}
        </>
    );
};

export default WhitelistPage;