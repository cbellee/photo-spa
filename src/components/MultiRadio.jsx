import React, { useState, Fragment } from 'react'
import './multiradio.css';

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

        //props.handler(props.imageName);
        let isChecked = checkState.options.map(o => o.checked && o.label === e.target.id)
        console.log("image name: " + props.imageName)
        console.log("checked: " + e.target.checked)
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
                <div className="grid grid-cols-2">
                    <label htmlFor={props.imageName} className="flex mr-12">{o.label}</label>
                    <input
                        onClick={(e) => onChange(e)}
                        type="radio"
                        className="h-3.5 mt-1.5"
                        name={props.groupName}
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
