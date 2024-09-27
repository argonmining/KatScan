import React, {Children, FC, PropsWithChildren, useState} from "react";
import {Tab, Tabs} from "react-bootstrap";

type Props = {
    titles: string[]
}

export const CustomTabs: FC<PropsWithChildren<Props>> = (
    {
        titles,
        children
    }
) => {
    const [currentTab, setCurrentTab] = useState<string | null>('0')

    return <Tabs defaultActiveKey='0' className="mb-3" onSelect={setCurrentTab}>
        {Children.map(children, (single, index) =>
            <Tab key={titles[index]} eventKey={String(index)} title={titles[index]}>
                {currentTab === String(index) && single}
            </Tab>
        )}
    </Tabs>
}