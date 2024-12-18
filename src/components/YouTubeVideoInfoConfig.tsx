import {Field, RenderManualFieldExtensionConfigScreenCtx} from 'datocms-plugin-sdk';
import {Canvas, Form, SelectField} from 'datocms-react-ui';
import {useEffect, useMemo, useState} from 'react';

export type Option = { label: string | React.ReactNode, value: string }
export type PluginParams = {
    selectedField: Field | null;
}

export const videoFieldToOption = (videoField: Field): Option => {
    const {id, attributes: {label, api_key}} = videoField;

    const value = id;
    const fullLabel = label ? <>{label} (<code>{api_key}</code>)</> : <code>{api_key}</code>;

    return ({
        label: fullLabel,
        value
    })
}

export const YouTubeVideoInfoConfig = ({ctx}: { ctx: RenderManualFieldExtensionConfigScreenCtx }) => {

    const videoFields = useMemo<{ [key: string]: Field }>(() => {
        if (!ctx.fields) return {};

        const allFields = Object.entries(ctx.fields) as [string, Field][];

        const videoFields = allFields.filter(
            ([_, field]) => field.attributes.field_type === 'video'
        );

        const videoFieldsSortedByPosition = videoFields.sort(
            (a, b) => a[1].attributes.position - b[1].attributes.position
        );


        return Object.fromEntries(videoFieldsSortedByPosition);
    }, [ctx.fields]);

    const videoFieldsAsOptions = useMemo<Option[]>(() => {
        return Object.values(videoFields).map(field => videoFieldToOption(field));
    }, [videoFields]);

    const [selectedOption, setSelectedOption] = useState<Option | null>(!!Object.keys(videoFields) ? videoFieldToOption(Object.values(videoFields)[0]) : null);

    useEffect(() => {
        (async () => {
            if (!selectedOption?.value) {
                await ctx.setParameters({selectedField: null} as PluginParams)
                return
            }
            await ctx.setParameters({selectedField: videoFields[selectedOption.value]} as PluginParams)
            return;
        })()
    }, [selectedOption])

    return (
        <Canvas ctx={ctx}>
            {JSON.stringify(ctx.parameters)}
            <Form>
                <SelectField
                    name="option"
                    id="option"
                    label="Option"
                    hint="Select one of the options"
                    value={selectedOption}
                    selectInputProps={{
                        options: videoFieldsAsOptions,
                        isMulti: false,
                    }}
                    onChange={(newValue) => setSelectedOption(newValue)}
                />
            </Form>
        </Canvas>
    );
}