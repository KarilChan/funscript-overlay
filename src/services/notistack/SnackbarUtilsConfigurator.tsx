import {OptionsObject, useSnackbar, WithSnackbarProps} from 'notistack';
import React from 'react';

const defaultOptions: OptionsObject = {
    autoHideDuration: 2250,
};

interface IProps {
    setUseSnackbarRef: (showSnackbar: WithSnackbarProps) => void;
}

const InnerSnackbarUtilsConfigurator: React.FC<IProps> = (props: IProps) => {
    props.setUseSnackbarRef(useSnackbar());
    return null;
};

let useSnackbarRef: WithSnackbarProps;
const setUseSnackbarRef = (useSnackbarRefProp: WithSnackbarProps) => {
    useSnackbarRef = useSnackbarRefProp;
};

export const SnackbarUtilsConfigurator = (): JSX.Element => (
    <InnerSnackbarUtilsConfigurator setUseSnackbarRef={setUseSnackbarRef}/>
);

const Notify = {
    success: (msg: string): void => {
        Notify.toast(msg, {
            variant: 'success',
            autoHideDuration: 5000,
        });
    },
    warning: (msg: string): void => {
        Notify.toast(msg, {
            variant: 'warning',
            autoHideDuration: 7500,
        });
    },
    info: (msg: string): void => {
        Notify.toast(msg, {
            variant: 'info',
            autoHideDuration: 5000,
        });
    },
    error: (msg: string, toastOptions: OptionsObject = {}): void => {
        Notify.toast(msg, {
            variant: 'error',
            persist: true,
            ...toastOptions,
        });
    },
    toast: (msg: string, options: OptionsObject): void => {
        useSnackbarRef?.enqueueSnackbar(msg, {...defaultOptions, ...options});
    }
};
export default Notify;