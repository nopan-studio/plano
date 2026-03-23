from flask import Blueprint, Response, stream_with_context
from app.events import event_bus, sse_generator

events_bp = Blueprint('events', __name__)

@events_bp.route('/api/events')
def stream_events():
    """Endpoint for streaming Server-Sent Events."""
    q = event_bus.listen()
    return Response(
        stream_with_context(sse_generator(q)),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )
