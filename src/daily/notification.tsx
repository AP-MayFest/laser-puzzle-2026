import './notification.css';

import {type Category, type Notification, useCloseNotification, useNotifications} from './state/notification.ts';
import type {FC} from 'react';
import {useCallback, useEffect} from 'react';

export const NotificationDisplay = () => {
    const notifications = useNotifications();

    return <div className='notifications'>
        { notifications.map(n => <Notification key={n.id} notification={n} />) }
    </div>;
};

const Notification : FC<{ notification: Notification }> = ({ notification }) => {
    const closer = useCloseNotification();
    const close = useCallback(() => closer(notification), [closer, notification]);
    const { category, message, closeMethod } = notification;

    if (closeMethod === 'auto') return <AutoCloseNotification category={category} message={message} close={close} />;
    if (closeMethod === 'button') return <ButtonCloseNotification category={category} message={message} close={close} />;
};

const AutoCloseNotification: FC<{ category: Category, message: string, close: () => void }> = ({ category, message, close }) => {
    useEffect(() => {
        const id = setTimeout(close, 3000);
        return () => {
            clearTimeout(id);
        };
    }, [close]);

    return <div className={['notification', 'auto-close', category].join(' ')}>
        <p>{ message }</p>
    </div>;
};

const ButtonCloseNotification: FC<{ category: Category, message: string, close: () => void }> = ({ category, message, close }) => {
    return <div className={['notification', category].join(' ')}>
        <p>{ message }</p>
        <button onClick={close}>閉じる</button>
    </div>;
};
