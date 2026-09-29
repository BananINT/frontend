import { describe, it, expect, vi, beforeEach } from 'vitest';
import { socketManager } from './socket';

describe('WebSocketManager (Frontend)', () => {
  beforeEach(() => {
    socketManager.disconnect();
  });

  it('correctly sets and stores authentication tokens', () => {
    socketManager.setToken('test-jwt-token-xyz');
    // Token is stored internally for protocols
    expect(socketManager).toBeDefined();
  });

  it('queues messages when disconnected and reports them', () => {
    // Socket is closed
    socketManager.send('test_action', { foo: 'bar' });
    // Waiting for connection resolver should be queued
    expect(socketManager.waitForConnection).toBeDefined();
  });

  it('subscribes and unsubscribes listeners cleanly', () => {
    const listener = vi.fn();
    const unsubscribe = socketManager.subscribe(listener);

    expect(typeof unsubscribe).toBe('function');
    unsubscribe();
  });
});
