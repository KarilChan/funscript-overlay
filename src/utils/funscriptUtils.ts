import {Action} from 'funscript-utils/lib/types';

type ActionPair = readonly [Action, Action];
export const getSpeed = (actionA: Action, actionB: Action): number => {
    const durationMs = actionB.at - actionA.at;
    if (durationMs <= 0) {
        console.warn('Skipping sus actions', {actionA, actionB});
        return 0;
    }

    const distance = Math.abs(actionB.pos - actionA.pos);
    return Math.round(distance / durationMs * 1000);
};

export const getAverageSpeed = (actionPairs: ActionPair[], durationMs: number): number => {
    const totalDistance = actionPairs.reduce((total, [actionA, actionB]) => {
        return total + getDistance(actionA, actionB);
    }, 0);
    return totalDistance / durationMs * 1000;
};

export const getDistance = (actionA: Action, actionB: Action): number => {
    return Math.abs(actionB.pos - actionA.pos);
};

export const toActionPairs = (actions: Action[]): ActionPair[] => actions
    .slice(0, -1)
    .map((action, index) => [action, actions[index + 1]] as const);
