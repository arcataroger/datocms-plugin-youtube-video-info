import {Button, Canvas} from 'datocms-react-ui';
import {type RenderFieldExtensionCtx} from "datocms-plugin-sdk";
import {PluginParams} from "./YouTubeVideoInfoConfig.tsx";

type VideoField = {
    "url": string;
    "title"?: string;
    "width"?: number,
    "height"?: number;
    "provider"?: "youtube" | string;
    "provider_uid"?: string;
    "thumbnail_url"?: string;
}

const fetchFromYoutube = async (id: string, youtubeDataApiKey?: string):Promise<string|null> => {
    const DEFAULT_YOUTUBE_API_KEY = 'AIzaSyAbt_WMN9zAu-5-_dlQlMSbg15rA6sw8k8' // Default DatoCMS Google Cloud project, may be quota-limited

    if(!id) {
        return null;
    }

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${youtubeDataApiKey ?? DEFAULT_YOUTUBE_API_KEY}`);
        const responseObj = await response.json();
        return JSON.stringify(responseObj, null, 2);
    } catch (error) {
        console.error(error)
        return null
    }
}

export const YouTubeVideoInfo = ({ctx}: { ctx: RenderFieldExtensionCtx }) => {
    const {selectedField} = ctx.parameters as PluginParams;
    if (!selectedField) {
        return <Canvas ctx={ctx}>
            <p>You did not select a field.</p>
        </Canvas>
    }

    const {label, api_key} = selectedField.attributes;
    const {provider_uid} = ctx.formValues[api_key] as VideoField;

    const insertLoremIpsum = async () => {
        if (!provider_uid) {
            return;
        }
        const info = await fetchFromYoutube(provider_uid)
        await ctx.setFieldValue(ctx.fieldPath, info);
    };


    return (
        <Canvas ctx={ctx}>
            <h3>YouTube Video Info for the field "{label}" (<code>{api_key}</code>)</h3>
            <code>
                <pre>{ctx.formValues[ctx.fieldPath] as string}</pre>
            </code>
            <Button type="button" onClick={insertLoremIpsum} buttonSize="xxs">
                Add lorem ipsum
            </Button>
        </Canvas>
    );
}