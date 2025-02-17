/**
 * @file - Types for the state of notification store.
 */

type NotificationPosition = `${'bottom' | 'top'}${' ' | '_'}${
    | 'center'
    | 'left'
    | 'right'}`;

type NotificationType =
    | 'danger'
    | 'info'
    | 'success'
    | 'unimportant'
    | 'warning';

export interface NotificationsState {
    groups: NotificationPosition[];
    permission: NotificationPermission;
}
