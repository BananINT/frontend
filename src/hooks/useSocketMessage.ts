import { useEffect, useEffectEvent } from 'react';
import { socketManager, type WebSocketMessage } from '@app/lib/socket';

/**
 * Subscribes to one socket message type (or a list of them) for the lifetime
 * of the component. The handler always sees the latest props and state, so it
 * does not need to be memoised and changing it never re-subscribes.
 *
 * The handler receives `message.data` first and the whole frame second, for
 * the few frames (errors) that carry their payload outside `data`.
 */
export function useSocketMessage<T = unknown>(
    type: string | readonly string[],
    handler: (data: T, message: WebSocketMessage<T>) => void,
): void {
    const onMessage = useEffectEvent((message: WebSocketMessage) => {
        handler(message.data as T, message as WebSocketMessage<T>);
    });

    // A list is compared by content so an inline array literal stays stable.
    const key = typeof type === 'string' ? type : type.join('\n');

    useEffect(() => {
        const types = new Set(key.split('\n'));
        const listener = (message: WebSocketMessage) => {
            if (message && types.has(message.type)) onMessage(message);
        };
        socketManager.subscribe(listener);
        return () => socketManager.unsubscribe(listener);
    }, [key]);
}
