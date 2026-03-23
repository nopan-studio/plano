import json
from queue import Queue, Empty

class EventBus:
    def __init__(self):
        self.listeners = []

    def listen(self):
        q = Queue(maxsize=100)
        self.listeners.append(q)
        return q

    def broadcast(self, event_type, data):
        message = json.dumps({'type': event_type, 'data': data})
        for q in self.listeners[:]:
            try:
                q.put_nowait(message)
            except Exception:
                if q in self.listeners:
                    self.listeners.remove(q)

event_bus = EventBus()

def sse_generator(q):
    """Generator for Server-Sent Events."""
    while True:
        try:
            # Wait for data from the queue
            message = q.get(timeout=30)  # Heartbeat every 30s if no data
            yield f"data: {message}\n\n"
        except Empty:
            # Send an empty comment as a heartbeat to keep the connection alive
            yield ": heartbeat\n\n"
        except Exception:
            break
