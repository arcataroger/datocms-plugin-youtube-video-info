import {connect, RenderFieldExtensionCtx, RenderManualFieldExtensionConfigScreenCtx} from "datocms-plugin-sdk";
import "datocms-react-ui/styles.css";
import ConfigScreen from "./entrypoints/ConfigScreen";
import {render} from "./utils/render";
import {YouTubeVideoInfo} from "./components/YouTubeVideoInfo.tsx";
import {YouTubeVideoInfoConfig} from "./components/YouTubeVideoInfoConfig.tsx";

connect({
    renderConfigScreen(ctx) {
        return render(<ConfigScreen ctx={ctx}/>);
    },
    manualFieldExtensions() {
        return [
            {
                id: 'youtubeVideoInfo',
                name: 'YouTube Video Info',
                type: 'editor',
                fieldTypes: ['json'],
                configurable: true,
            },
        ];
    },
    renderManualFieldExtensionConfigScreen(_, ctx: RenderManualFieldExtensionConfigScreenCtx) {
        render(<YouTubeVideoInfoConfig ctx={ctx}/>)
    },
    renderFieldExtension(_, ctx: RenderFieldExtensionCtx) {
        render(<YouTubeVideoInfo ctx={ctx}/>)
    }
});
