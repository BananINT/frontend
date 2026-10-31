export interface SseEvent {
  /** The `event:` field, `message` when the frame has none. */
  event: string;
  /** The last `data:` line of the frame, trimmed. */
  data: string;
}

/**
 * Splits a buffered text/event-stream into complete frames. The trailing,
 * possibly partial frame comes back as `rest` to prepend to the next chunk.
 * Frames that are blank or carry no data are dropped.
 */
export function takeSseEvents(buffer: string): { events: SseEvent[]; rest: string } {
  const frames = buffer.split('\n\n');
  const rest = frames.pop() || '';
  const events: SseEvent[] = [];

  for (const evt of frames) {
    if (!evt.trim()) continue;

    let eventType = 'message';
    let dataStr = '';

    for (const line of evt.split('\n')) {
      if (line.startsWith('event: ')) {
        eventType = line.replace('event: ', '').trim();
      } else if (line.startsWith('data: ')) {
        dataStr = line.replace('data: ', '').trim();
      }
    }

    if (!dataStr) continue;
    events.push({ event: eventType, data: dataStr });
  }

  return { events, rest };
}
