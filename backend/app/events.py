import json
from flask_socketio import SocketIO, emit

class SocketEventBus:
    def __init__(self):
        self.socketio = None

    def init_app(self, app):
        self.socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')
        return self.socketio

    def broadcast(self, event_type, data):
        """Broadcast an event to all connected clients via WebSockets."""
        if self.socketio:
            self.socketio.emit('message', {'type': event_type, 'data': data})
        else:
            print(f"⚠️ SocketIO not initialized. Event dropped: {event_type}")

event_bus = SocketEventBus()
