import {LogCallback} from '@ffmpeg/ffmpeg';
import {isProgressOutput} from './isProcessOutput';

export const extractProcessingFps = (ffLog: Parameters<LogCallback>[0]): number | null => {
    if (!isProgressOutput(ffLog)) {
        return null;
    }
    const match = ffLog.message.match(/fps=\s*(\d+)/);
    if (!match) {
        return null;
    }

    const potentialFps = parseInt(match[1], 10);
    if (potentialFps >= 0) {
        return potentialFps;
    }

    return null;
};