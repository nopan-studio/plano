"""
Plano entry point — imports app factory and runs the server.
Copyright (C) 2026 nopan-studio
Licensed under GNU General Public License v3.0.
"""
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
    application = create_app()

    print(f'  Plano PM running on http://{args.host}:{args.port}')
    print(f'  Health check: http://{args.host}:{args.port}/health')
    print(f'  API docs:     http://{args.host}:{args.port}/api')
    print(f'  Dashboard:    http://{args.host}:{args.port}/')
    print('  Press Ctrl+C to stop.\n')

    application.run(
        host=args.host,
        port=args.port,
       #debug=args.debug,
        debug=True,
        use_reloader=False,
        threaded=True,
    )


if __name__ == '__main__':
    main()
