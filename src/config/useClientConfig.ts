import {clientConfig} from './clientConfig';
import useLocalStorageState, {LocalStorageState} from 'use-local-storage-state';

export type ClientConfigKey = keyof typeof clientConfig;
export type ClientConfigType<K extends ClientConfigKey> = typeof clientConfig[K]['defaultValue'];
export const useClientConfig = <K extends ClientConfigKey, T extends ClientConfigType<K>>(
    key: K
): LocalStorageState<T> => {
    const config = clientConfig[key];
    return useLocalStorageState(key, {
        defaultValue: config.defaultValue,
        storageSync: false
    }) as unknown as LocalStorageState<T>;
};
