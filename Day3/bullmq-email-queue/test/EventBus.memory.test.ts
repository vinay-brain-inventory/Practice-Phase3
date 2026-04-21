import { EventBus } from "../src/events/EventBus";

test("does not leak listeners across subscribe/unsubscribe", () => {
  const bus = new EventBus({ maxListeners: 25 });

  const start = bus.listenerCount();

  for (let i = 0; i < 200; i++) {
    const off = bus.subscribe("email.sent", () => {});
    off();
  }

  expect(bus.listenerCount()).toBe(start);
});

test("supports once with wildcard patterns", () => {
  const bus = new EventBus({ maxListeners: 25 });
  const seen: string[] = [];

  bus.once("email.*", (payload) => {
    seen.push(String(payload));
  });

  bus.publish("email.sent", "a");
  bus.publish("email.sent", "b");

  expect(seen).toEqual(["a"]);
});

test("enforces max listener limit", () => {
  const bus = new EventBus({ maxListeners: 3 });

  bus.subscribe("*", () => {});
  bus.subscribe("email.*", () => {});
  bus.subscribe("email.sent", () => {});

  expect(() => bus.subscribe("x", () => {})).toThrow("max listeners exceeded");
});

