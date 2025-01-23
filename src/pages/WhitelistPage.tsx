import React, {FC, useMemo, useState} from "react";
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
    return <Page header="Whitelist"
                 additionalHeaderComponent={
                     <Input customClass={'whitelist-search-form'}
                            placeholder={'Search for Address...'}
                            onChangeCallback={setSearchTerm}
                            onSubmit={setSearchTerm}/>
                 }>
        <div className={'whitelists-page'}>
            <Whitelist searchTerm={searchTerm}/>
        </div>
    </Page>
}

const donHeaders = ['address', 'actions']

type ListProps = {
    searchTerm: string
}

const Whitelist: FC<ListProps> = ({searchTerm}) => {
    const [selectedWhitelist, setSelectedWhitelist] = useState<WhitelistData | null>(null);
    const [shouldAvoidLoading, setShouldAvoidLoading] = useState(false);
    const {data, loading} = useFetch<WhitelistData[]>({
        url: '/whitelist',
        avoidLoading: shouldAvoidLoading,
        sort: ['id', 'asc']
    });

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
                noDataText={'No Data available'}
                isLoading={loading}
                showHeader={false}
            />
            
            {selectedWhitelist && (
                <WhitelistUpdateModal
                    show={true}
                    onClose={() => setSelectedWhitelist(null)}
                    whitelistData={selectedWhitelist}
                    onSuccess={() => {
                        setShouldAvoidLoading(false);
                        setSelectedWhitelist(null);
                    }}
                />
            )}
        </>
    );
};

export default WhitelistPage;