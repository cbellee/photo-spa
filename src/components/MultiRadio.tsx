import React, { useState, Fragment } from 'react'
import '../styles/multiradio.css';

export default function MultiRadio(props) {
    const def = {
        limit: 1,
        options: [
            {
                label: props.groupName,
                checked: false,
            },
        ],
    }

    const [checkState, setCheckState] = useState(def);

    const onChange = (e) => {
        const invert =
            checkState.options.filter(o => o.checked && o.label === e.target.id)
                .length === def.limit

        let isChecked = checkState.options.map(o => o.checked && o.label === e.target.id)
        //console.log("image name: " + props.imageName)
        //console.log("checked: " + e.target.checked)
        props.handler(props.imageName);

        setCheckState({
            options: checkState.options.reduce(
                (arr, opt) => [
                    ...arr,
                    {
                        ...opt,
                        checked:
                            e.target.id === opt.label
                                ? e.target.checked
                                : invert
                                    ? opt.checked
                                    : !opt.checked,
                    },
                ],
                []
            ),
        }, [])
    }

    const render = (data) => {
        return data.options.map(o => (
            <Fragment key={props.imageName}>
                <div className="flex flex-row justify-start items-center">
                    <label htmlFor={props.imageName} className="font-semibold">{o.label} thumb</label>
                    <input
                        onClick={(e) => onChange(e)}
                        onChange={(e) => onChange(e)}
                        type="radio"
                        className="h-3.5 justify-end ml-2 align-middle"
                        name={props.groupName}
                        defaultChecked={props.checked}
                    />
                </div>
            </Fragment>
        ));
    };

    return (
        <>
            {render(checkState)}
        </>
    )
}
