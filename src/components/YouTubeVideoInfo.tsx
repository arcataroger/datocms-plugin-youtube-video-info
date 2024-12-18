import {Button, Canvas} from 'datocms-react-ui';
import {type RenderFieldExtensionCtx} from "datocms-plugin-sdk";
import {PluginParams} from "./YouTubeVideoInfoConfig.tsx";
import {useEffect, useMemo} from "react";
/// <reference types="gapi" />

type VideoField = {
    "url": string;
    "title"?: string;
    "width"?: number,
    "height"?: number;
    "provider"?: "youtube" | string;
    "provider_uid"?: string;
    "thumbnail_url"?: string;
}

const fetchFromYoutube = async (id: string, youtubeDataApiKey?: string): Promise<string | null> => {

    const keyFromEnvVar: string = import.meta.env.VITE_YOUTUBE_API_KEY;

    if (!id) {
        throw new Error('No video ID provided');
    }

    if (!youtubeDataApiKey && !keyFromEnvVar) {
        throw new Error('No YouTube Data API key provided, and none found in env vars. Please get one and configure the plugin.')
    }

    try {
        // https://developers.google.com/youtube/v3/docs/videos/list
        const url = new URL('https://www.googleapis.com/youtube/v3/videos');
        url.search = new URLSearchParams({
            id,
            key: youtubeDataApiKey ?? keyFromEnvVar,
            part: 'snippet,contentDetails,statistics',
        }).toString();
        const response = await fetch(url);
        const responseObj = await response.json();
        return JSON.stringify(responseObj.items[0], null, 2);
    } catch (error) {
        console.error(error)
        return null
    }
}

export const YouTubeVideoInfo = ({ctx}: { ctx: RenderFieldExtensionCtx }) => {

    const currentValue = ctx.formValues[ctx.fieldPath] as string | null;

    const {selectedField} = ctx.parameters as PluginParams;
    if (!selectedField) {
        return <Canvas ctx={ctx}>
            <p>You did not select a field.</p>
        </Canvas>
    }

    const {label, api_key} = selectedField.attributes;
    const {provider_uid, provider, url} = ctx.formValues[api_key] as VideoField;

    if (provider !== 'youtube') {
        return <Canvas ctx={ctx}>
            <p>Only YouTube videos are supported. Your video points to {provider}: <code>{url}</code></p>
        </Canvas>
    }

    const getAndSetVideoInfo = async () => {
        if (!provider_uid) {
            return;
        }
        const videoInfoString = await fetchFromYoutube(provider_uid)
        await ctx.setFieldValue(ctx.fieldPath, videoInfoString);
    };

    const videoInfo = useMemo<GoogleApiYouTubeVideoResource>(() => currentValue ? JSON.parse(currentValue) : null, [currentValue])

    useEffect(() => {

        (async () => {
            if (provider === 'youtube') {
                await getAndSetVideoInfo();
            } else {
                await ctx.setFieldValue(ctx.fieldPath, null);
            }
        })()

    }, [provider_uid, provider])

    return (
        <Canvas ctx={ctx}>
            <h3>YouTube Video Info for the field "{label}" (<code>{api_key}</code>)</h3>
            <Button type="button" onClick={getAndSetVideoInfo} buttonSize="xxs">
                Refresh video info
            </Button>
            <ul>
                <li>Thumbnails: {JSON.stringify(videoInfo.snippet.thumbnails)}</li>
            </ul>
            <h4>Debug</h4>
            <code>
                <pre>{currentValue}</pre>
            </code>
        </Canvas>
    );
}