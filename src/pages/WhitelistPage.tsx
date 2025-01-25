import React, {FC, ReactElement, useCallback, useMemo, useRef, useState} from "react";
import {FetchRef, SortFetchHook, useFetch} from "../hooks/useFetch";
import {Input, List, Page} from "nacho-component-library";
import {WhitelistUpdateModal} from "../components/whitelist/WhitelistUpdateModal";
import '../styles/WhitelistPage.css'
import {BasicButton} from "../components/button/BasicButton";
import {useSubscription} from "../services/subscription/useSubscription";
import {Message} from "@stomp/stompjs";

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
                <Whitelist searchTerm={searchTerm}/>
            </div>
        </Page>
    );
}

type ListProps = {
    searchTerm: string
}

const sort: SortFetchHook = ['id', 'asc']
const headers = ['id', 'address', 'action']
const Whitelist: FC<ListProps> = ({searchTerm}) => {
    const [selectedWhitelist, setSelectedWhitelist] = useState<WhitelistData | null>(null);

    const ref = useRef<FetchRef<WhitelistData[]>>(null)
    const {data, loading} = useFetch<WhitelistData[]>({
        url: '/whitelist',
        sort: sort,
        ref
    });
    const callback = useCallback((message: Message) => {
        const body = JSON.parse(message.body).content as WhitelistData
        ref.current?.updateData([...ref.current?.getData().map(single => single.id === body.id ? body : single)])

    }, [])
    useSubscription('Whitelist', 'update', callback)

    const internalData = useMemo(() => {
        if (!data) return [];
        if (searchTerm === '') {
            return data;
        }
        return data.filter(single => single.address.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [data, searchTerm]);

    const getElement = (header: string, item: WhitelistData): ReactElement => {
        switch (header) {
            case 'action':
                return <div className="list-cell actions">
                    <BasicButton
                        size="sm"
                        variant={"outline-primary"}
                        onClick={() => setSelectedWhitelist(item)}
                    >
                        Edit
                    </BasicButton>
                </div>
            default:
                return <div style={{
                    overflowY: 'auto',
                    height: '100%',
                    display: "flex",
                    alignItems: "center"
                }}>{item[header as keyof WhitelistData]}</div>
        }
    }
    const getHeader = (header: string): ReactElement | null => {
        switch (header) {
            case 'action':
                return null
            default:
                return <span>{header.toUpperCase()}</span>
        }
    }
    return (
        <>
            <List headerElements={headers}
                  alternateIdKey={'id'}
                  items={internalData}
                  minItemHeight={50}
                  gridTemplate={'min(45px) 5fr min(65px)'}
                  getElement={getElement}
                  getHeader={getHeader}
                  noDataText={'No whitelist entries found'}
                  isLoading={loading}/>

            {selectedWhitelist && (
                <WhitelistUpdateModal
                    show={true}
                    onClose={() => setSelectedWhitelist(null)}
                    whitelistData={selectedWhitelist}
                    onSuccess={() => setSelectedWhitelist(null)}
                />
            )}
        </>
    );
};

export default WhitelistPage;