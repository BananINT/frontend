import { describe, it, expect } from 'vitest';
import { takeSseEvents } from './sseEvents';

describe('takeSseEvents', () => {
  it('splits complete frames and keeps the partial tail', () => {
    const { events, rest } = takeSseEvents('event: meta\ndata: {"a":1}\n\nevent: chunk\ndata: {"text":"Ba"}\n\nevent: chu');
    expect(events).toEqual([
      { event: 'meta', data: '{"a":1}' },
      { event: 'chunk', data: '{"text":"Ba"}' },
    ]);
    expect(rest).toBe('event: chu');
  });

  it('defaults the event name and drops frames without data', () => {
    const { events, rest } = takeSseEvents('data: {"x":2}\n\nevent: ping\n\n\n\n');
    expect(events).toEqual([{ event: 'message', data: '{"x":2}' }]);
    expect(rest).toBe('');
  });

  it('keeps the last data line of a frame', () => {
    expect(takeSseEvents('event: done\ndata: 1\ndata: 2\n\n').events).toEqual([{ event: 'done', data: '2' }]);
  });
});
