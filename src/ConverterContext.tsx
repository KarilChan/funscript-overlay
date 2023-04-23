import React, {useMemo, useState} from 'react';
import {createTheme, responsiveFontSizes, Theme} from '@mui/material/styles';
import {indigo, orange, yellow} from '@mui/material/colors';
import {IOverlayState} from './overlay/IOverlayState';
import {useClientConfig} from './config/useClientConfig';
import {Action, Funscript} from 'funscript-utils/lib/types';
import Notify from './services/notistack/SnackbarUtilsConfigurator';
import {getAverageSpeed, getDistance, getSpeed, toActionPairs} from './utils/funscriptUtils';

interface ContextState {
    toSrt: () => string,
    script: Funscript | null,
    setScript: (script: Funscript | null) => void,
}

/**
 * 0-1, 1 being the highest warning level
 */
const getWarningLevelBySpeed = (
    speed: number,
    maxSpeed: number | null,
    minSpeed: number | null
): number => {
    if (maxSpeed !== null && speed > maxSpeed) {
        return Math.min(1, (speed - maxSpeed) / 100);
    }

    if (minSpeed !== null && speed < minSpeed) {
        return Math.min(1, (minSpeed - speed) / 100);
    }

    return 0;
};

const getWarningLevelByTolerance = (tolerance: number, limit: number): number => {
    return Math.min(Math.max(0, tolerance / limit - 1), 1);
};

// Gradient from green to yellow to red
const getColorByWarningLevel = (level: number): string => {
    level = Math.min(Math.max(0, level), 1);
    const {r, g} = {
        // From green to yellow to red
        r: Math.min(255, 255 * 2 * (level)),
        g: Math.min(255, 255 * 2 * (1 - level)),
    };
    const rHex = Math.round(r).toString(16).padStart(2, '0');
    const gHex = Math.round(g).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}00`;
};

export const ConverterContext = React.createContext<ContextState>({} as ContextState);
export const ConverterContextProvider = (props: { children: React.ReactNode }): JSX.Element => {
    const [maxSpeed] = useClientConfig('overlay.speed.max');
    const [minSpeed] = useClientConfig('overlay.speed.min');
    const [searchAheadMs] = useClientConfig('overlay.searchAheadMs');
    const [refreshRate] = useClientConfig('overlay.refreshRateMs');
    const [tolerance] = useClientConfig('overlay.tolerance');
    const [debugMode] = useClientConfig('overlay.isDebugMode');
    const [safeText] = useClientConfig('overlay.text.safe');
    const [warnText] = useClientConfig('overlay.text.warn');

    const [script, setScript] = React.useState<Funscript | null>(null);

    const validate = (): void => {
        // Validation, if invalid inputs are somehow not caught earlier
        if (minSpeed > maxSpeed) {
            throw new Error(`minSpeed (${minSpeed}) is greater than maxSpeed (${maxSpeed})`);
        }
        if (minSpeed < 0 || maxSpeed < 0) {
            throw new Error(`minSpeed (${minSpeed}) or maxSpeed (${maxSpeed}) is less than 0`);
        }
        if (searchAheadMs < 0) {
            throw new Error(`searchAhead (${searchAheadMs}ms) is less than 0`);
        }
        if (refreshRate < 0) {
            throw new Error(`refreshRate (${refreshRate}ms) is less than 0`);
        }
    };
    const toOverlayStates = (): IOverlayState[] => {
        if (!script) {
            throw new Error('Script or video duration not set');
        }
        try {
            validate();
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unknown error';
            Notify.error(msg);
            throw e;
        }

        console.log('Converting with settings', {
            maxSpeed,
            minSpeed,
            searchAheadMs,
            refreshRate,
            tolerance,
        });

        const scriptDuration = script.actions[script.actions.length - 1].at;
        const states: IOverlayState[] = [];
        for (let currentMs = 0; currentMs < scriptDuration; currentMs += refreshRate) {
            const actions = findActions(currentMs);
            const actionPairs = toActionPairs(actions);
            states.push({
                startMs: currentMs,
                endMs: currentMs + refreshRate,
                averageSpeed: getAverageSpeed(actionPairs, searchAheadMs),
                tolerancePoints: actionPairs.reduce((total, [a, b]) => {
                    return total + getTolerancePoints(a, b);
                }, 0),
            });
        }

        return states;
    };

    const toSrt = (): string => {
        /**
         * SRT example
         * 1
         * 00:00:01,000 --> 00:00:04,000
         * {\\an1}<font color="#00FF00">Bottom-left: an1</font>
         *
         * 2
         * 00:00:04,000 --> 00:00:08,000
         * {\\an1}<font color="#00FF00">Bottom-left: an1</font>
         *
         * 3
         * 00:00:09,000 --> 00:00:12,000
         * {\\an1}<font color="#00FF00">Bottom-left: an1</font>
         */
        const subtitles = toOverlayStates();
        const srtBlocks = subtitles.map((subtitle, index) => {
            const start = msToSrtTime(subtitle.startMs);
            const end = msToSrtTime(subtitle.endMs);
            const warningLevel = Math.max(
                getWarningLevelBySpeed(subtitle.averageSpeed, maxSpeed, minSpeed),
                getWarningLevelByTolerance(subtitle.tolerancePoints, tolerance)
            );
            const fontColor = getColorByWarningLevel(warningLevel);
            const isSafe = warningLevel === 0;
            const text = debugMode
                ? `${subtitle.tolerancePoints.toFixed(2)} tolerance (${subtitle.averageSpeed.toFixed(0)}u/s)`
                : (isSafe ? safeText : warnText);
            return `
${index + 1}
${start} --> ${end}
{\\an1}<font color=${fontColor}>${text}</font>
`;

        });
        return srtBlocks.join('\n');
    };

    const msToSrtTime = (ms: number): string => {
        const milliseconds = ms % 1000;
        ms -= milliseconds;
        const seconds = Math.floor(ms / 1000) % 60;
        ms -= seconds * 1000;
        const minutes = Math.floor(ms / 1000 / 60) % 60;
        ms -= minutes * 1000 * 60;
        const hours = Math.floor(ms / 1000 / 60 / 60) % 60;
        return `${hours}:${minutes}:${seconds},${milliseconds}`;
    };

    const findActions = (currentMs: number): Action[] => {
        if (!script) {
            throw new Error('This should not happen');
        }

        const firstActionIndex = script.actions.findIndex(action => action.at >= currentMs);
        if (firstActionIndex === -1) {
            return [];
        }

        const lastActionIndex = script.actions
            .findIndex(action => action.at >= currentMs + searchAheadMs);
        if (lastActionIndex === -1) {
            return script.actions.slice(firstActionIndex);
        }

        const matches = script.actions.slice(
            Math.max(0, firstActionIndex - 1),
            lastActionIndex + 1
        );

        return padActions(currentMs, matches);
    };

    const padActions = (currentMs: number, actions: Action[]): Action[] => {
        if (actions.length === 0) {
            return [
                {
                    at: currentMs,
                    pos: 0
                },
                {
                    at: currentMs + searchAheadMs,
                    pos: 0
                }
            ];
        }

        const filledActions: Action[] = [];
        if (actions[0].at > currentMs) {
            filledActions.push({
                at: currentMs,
                pos: actions[0].pos,
            });
        }

        filledActions.push(...actions);

        if (actions[actions.length - 1].at < currentMs + searchAheadMs) {
            filledActions.push({
                at: currentMs + searchAheadMs,
                pos: actions[actions.length - 1].pos,
            });
        }

        return filledActions;
    };
    const getTolerancePoints = (a: Action, b: Action): number => {
        const speed = getSpeed(a, b);
        if (passesMinSpeed(speed) && passesMaxSpeed(speed)) {
            return 0;
        }

        const offset = Math.abs(speed - (passesMinSpeed(speed) ? maxSpeed : minSpeed));

        return (offset / 100) * (b.at - a.at) / searchAheadMs;
    };

    const passesMinSpeed = (speed: number): boolean => {
        if (minSpeed === 0) {
            return true;
        }

        return speed >= minSpeed;
    };

    const passesMaxSpeed = (speed: number): boolean => {
        if (maxSpeed === 0) {
            return true;
        }

        return speed <= maxSpeed;
    };

    return (
        <ConverterContext.Provider
            value={{
                toSrt,
                script, setScript,
            }}
        >
            {props.children}
        </ConverterContext.Provider>
    );

};
