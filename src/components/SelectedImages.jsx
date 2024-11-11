import { useFormContext } from 'react-hook-form';
import React from 'react'
import MultiRadio from './MultiRadio';

export function SelectedImages(props) {
    const { register } = useFormContext();

    const radioOptions = props.images.map((image, idx) => (
        image.name
    ))

    function descriptionHandler(event) {
        console.log(event.target.value);
    }

    const render = (images) => {
        return images.map((image, idx) => (
            <div key={idx} className="text-white flex flex-col bg-gray-800 rounded-md pt-2 min-w-70">
                <div className="flex">
                    <img className="object-contain m-auto h-60 pb-4 pt-2" src={image.path} alt="" key={image.data} />
                </div>
                <div className='bg-gray-700 rounded-b-md'>
                    <div className="grid grid-cols-[40%_60%] m-auto pt-2 p-2 ml-2 mr-2 text-left justify-items-left">
                        <label className="">name</label>
                        <div className="pl-2">{image.name}</div>
                        <label className='' aria-placeholder='enter description'>description</label>
                        <input
                            type="text"
                            id={`metadata.${idx}.description`}
                            name={`metadata.${idx}.description`}
                            className='text-gray-400 bg-gray-600 rounded-sm pl-2'
                            {...register(`metadata.${idx}.description`)}
                            onChange={(e) => descriptionHandler(e)}
                            defaultValue={image.name.split(".")[0]}
                        />
                        <div>
                            <MultiRadio groupName="collection" imageName={`${image.name}`} handler={props.collectionThumbHandler} />
                            <MultiRadio groupName="album" imageName={`${image.name}`} handler={props.albumThumbHandler} />
                        </div>
                        <input
                            type='hidden'
                            id={`metadata.${idx}.name`}
                            name={`metadata.${idx}.name`}
                            {...register(`metadata.${idx}.name`)}
                            value={image.name}
                        />
                        <input
                            type='hidden'
                            id={`metadata.${idx}.type`}
                            name={`metadata.${idx}.type`}
                            {...register(`metadata.${idx}.type`)}
                            value={image.type}
                        />
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <>
            {render(props.images)}
        </>
    )
}