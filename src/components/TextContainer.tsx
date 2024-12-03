import React, {FC} from "react";

interface Props {
    text: string
    height?: string
    customClasses?: string,
    onClick?: () => void
}

export const TextContainer: FC<Props> = (
    {
        text,
        height,
        customClasses = '',
        onClick
    }
) => {
    return <div className={`text-container ${customClasses}`} style={{height: height}} onClick={onClick ?? undefined}>
        <span>{text}</span>
    </div>
}
