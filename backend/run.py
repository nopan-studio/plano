import eventlet
eventlet.monkey_patch()

import argparse
import sys


def main():
    parser = argparse.ArgumentParser(description='Plano PM server')
    parser.add_argument('--port', type=int, default=5000,
                        help='Port to listen on (default 5000)')
    parser.add_argument('--host', default='127.0.0.1',
                        help='Host to bind (default 127.0.0.1)')
    parser.add_argument('--debug', action='store_true',
                        help='Enable debug mode')
    args = parser.parse_args()

    from app import create_app
    from app.events import event_bus
    application = create_app()
    socketio = event_bus.socketio

    print(f'  Plano PM (WebSocket Mode) running on http://{args.host}:{args.port}')
    print(f'  Health check: http://{args.host}:{args.port}/health')
    print(f'  API docs:     http://{args.host}:{args.port}/api')
    print(f'  Dashboard:    http://{args.host}:{args.port}/')
    print('  Press Ctrl+C to stop.\n')

    socketio.run(
        application,
        host=args.host,
        port=args.port,
        debug=True,
        use_reloader=False,
    )


if __name__ == '__main__':
    main()
