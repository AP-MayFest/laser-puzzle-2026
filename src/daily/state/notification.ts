import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';


type Category = 'info' | 'warn' | 'feedback';

type CloseMethod = 'button' | 'auto';

export interface Notification {
  category: Category;
  message: string;
  close: CloseMethod;
}


const notifications = atom<Notification[]>([]);

export const useSubmitNotification = (): (notification: Notification) => void => {
  const setter = useSetAtom(notifications);
  return useCallback((notification: Notification) => setter(ns => ns.concat(notification)), [setter]);
};

export const useCloseNotification = (): (ref: Notification) => void => {
  const setter = useSetAtom(notifications);
  return useCallback((notification: Notification) => setter(ns => ns.filter(n => n !== notification)), [setter]);
};

export const useNotifications = (): Notification[] => useAtomValue(notifications);
