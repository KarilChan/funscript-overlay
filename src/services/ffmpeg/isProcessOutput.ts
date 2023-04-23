import {LogCallback} from '@ffmpeg/ffmpeg';

/**
 * FFMPEG progress output example:
 * "frame=  100 fps=0.0 q=-1.0 size=    1024kB time=00:00:03.33 bitrate= 245.7kbits/s speed=0.001x"
 */
export const isProgressOutput = (ffLog: Parameters<LogCallback>[0]): boolean => {
    return ffLog.type === 'fferr' && /frame=\s*\d+\s*fps=\s*\d+/.test(ffLog.message);
};
