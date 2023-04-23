import {LogCallback} from '@ffmpeg/ffmpeg';
import {isProgressOutput} from './isProcessOutput';

export const extractCurrentFrame = (ffLog: Parameters<LogCallback>[0]): number | null => {
    if (!isProgressOutput(ffLog)) {
        return null;
    }

    const match = ffLog.message.match(/frame=\s*(\d+)/);
    if (!match) {
        return null;
    }

    const potentialFrame = parseInt(match[1], 10);
    if (potentialFrame >= 0) {
        return potentialFrame;
    }

    return null;
};