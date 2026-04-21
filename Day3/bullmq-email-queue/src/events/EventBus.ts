import { EventEmitter } from "node:events";
import { matchesPattern } from "./wildcard";

export type EventListener<T = unknown> = (payload: T) => void;

type Entry = {
  pattern: string;
  listener: EventListener;
  once: boolean;
};

export class EventBus {
  private readonly emitter = new EventEmitter();
  private readonly entries: Entry[] = [];
  private readonly internalEvent = "__eventbus__";
  private maxListeners: number;

  constructor(opts?: { maxListeners?: number }) {
    this.maxListeners = opts?.maxListeners ?? 25;
    this.emitter.setMaxListeners(this.maxListeners);
  }

  publish<T>(eventName: string, payload: T) {
    this.emitter.emit(this.internalEvent, eventName, payload);
  }

  subscribe<T>(pattern: string, listener: EventListener<T>) {
    this.assertCapacity(1);

    const entry: Entry = { pattern, listener: listener as EventListener, once: false };
    this.entries.push(entry);

    const handler = (eventName: string, payload: unknown) => {
      if (!matchesPattern(pattern, eventName)) return;
      (listener as EventListener)(payload);
    };

    this.emitter.on(this.internalEvent, handler);

    return () => {
      this.unsubscribe(pattern, listener);
      this.emitter.off(this.internalEvent, handler);
    };
  }

  once<T>(pattern: string, listener: EventListener<T>) {
    this.assertCapacity(1);

    let off: (() => void) | null = null;
    const wrapped: EventListener<T> = (payload) => {
      off?.();
      listener(payload);
    };

    off = this.subscribe(pattern, wrapped);
    return off;
  }

  unsubscribe<T>(pattern: string, listener: EventListener<T>) {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      const e = this.entries[i];
      if (e.pattern === pattern && e.listener === (listener as EventListener)) {
        this.entries.splice(i, 1);
      }
    }
  }

  listenerCount() {
    return this.entries.length;
  }

  setMaxListeners(n: number) {
    this.maxListeners = Math.max(0, n);
    this.emitter.setMaxListeners(this.maxListeners);
  }

  private assertCapacity(extra: number) {
    if (this.maxListeners === 0) return;
    if (this.entries.length + extra > this.maxListeners) {
      throw new Error("max listeners exceeded");
    }
  }
}

