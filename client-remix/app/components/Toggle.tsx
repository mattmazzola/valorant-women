import React from "react"

type Props = {
    on: boolean
    onChange: (on: boolean) => void
    onLabel: string
    offLabel: string
}

const Component: React.FC<Props> = (props) => {

    return (
        <div className="toggle">
            <div className={`overlay ${props.on ? `on` : `off`}`}></div>
            <button type="button" className={props.on ? `text-white` : ``} onClick={() => props.onChange(true)}>{props.onLabel}</button>
            <button type="button" className={props.on ? `` : `text-white`} onClick={() => props.onChange(false)}>{props.offLabel}</button>
        </div>
    )
}

export default Component