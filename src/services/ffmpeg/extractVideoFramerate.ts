import {LogCallback} from '@ffmpeg/ffmpeg';

const hasVideoFramerate = (ffLog: Parameters<LogCallback>[0]): boolean => {
    // Match example:
    // "Stream #0:0(eng): Video: h264 (libx264) (avc1 / 0x31637661), yuv420p, 1920x1080 [SAR 1:1 DAR 16:9], q=-1--1, 60 fps, 15360 tbn, 60 tbc (default)"
    return ffLog.type === 'fferr' && /Stream.*Video.*fps/.test(ffLog.message);
};
export const extractVideoFramerate = (ffLog: Parameters<LogCallback>[0]): number | null => {
    if (!hasVideoFramerate(ffLog)) {
        return null;
    }
    const match = ffLog.message.match(/(\d+) fps/);
    if (!match) {
        console.log('No match');
        return null;
    }

    const potentialFramerate = parseInt(match[1], 10);
    // Parsing ffmpeg output is unreliable, do sanity check first
    if (potentialFramerate > 1 && potentialFramerate < 200) {
        return potentialFramerate;
    }

    return null;
};