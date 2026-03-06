import React, { useState, Fragment } from 'react'
import '../styles/multiradio.css';

interface MultiRadioProps {
    groupName: string;
    imageName: string;
    handler: (imageName: string) => void;
    checked: boolean;
}

interface Option {
    label: string;
    checked: boolean;
}

interface CheckState {
    limit: number;
    options: Option[];
}

export default function MultiRadio(props: MultiRadioProps) {
    const def: CheckState = {
        limit: 1,
        options: [
            {
                label: props.groupName,
                checked: false,
            },
        ],
    }

    const [checkState, setCheckState] = useState<CheckState>(def);

    const onChange = (e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const invert =
            checkState.options.filter(o => o.checked && o.label === target.id)
                .length === def.limit

        props.handler(props.imageName);

        setCheckState({
            ...checkState,
            options: checkState.options.map((opt) => ({
                ...opt,
                checked:
                    target.id === opt.label
                        ? target.checked
                        : invert
                            ? opt.checked
                            : !opt.checked,
            })),
        });
    }

    const render = (data: CheckState) => {
        return data.options.map((o: Option) => (
            <Fragment key={props.imageName}>
                <div className="flex flex-row justify-start items-center mb-2.5">
                    <label htmlFor={props.imageName} className="text-xs font-semibold uppercase tracking-wide opacity-70">{o.label} thumb</label>
                    <input
                        onClick={(e) => onChange(e)}
                        onChange={(e) => onChange(e)}
                        type="radio"
                        className="h-3.5 justify-end ml-2 align-middle accent-orange-500"
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
