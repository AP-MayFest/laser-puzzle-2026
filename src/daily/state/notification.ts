import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';


export type Category = 'info' | 'warn' | 'feedback';

type CloseMethod = 'button' | 'auto';

export interface Notification {
  id: number;
  category: Category;
  message: string;
  closeMethod: CloseMethod;
}


const notifications = atom<Notification[]>([]);

export const useSubmitNotification = (): (notification: Omit<Notification, 'id'>) => void => {
  const setter = useSetAtom(notifications);
  return useCallback((notification: Omit<Notification, 'id'>) => setter(ns => [Object.assign({id: ns.length}, notification)].concat(...ns)), [setter]);
};

export const useCloseNotification = (): (ref: Notification) => void => {
  const setter = useSetAtom(notifications);
  return useCallback((notification: Notification) => setter(ns => ns.filter(n => n !== notification)), [setter]);
};

export const useNotifications = (): Notification[] => useAtomValue(notifications);
