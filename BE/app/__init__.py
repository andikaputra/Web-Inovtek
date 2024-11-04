from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from config import Config

db = SQLAlchemy()
socketio = SocketIO()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    socketio.init_app(app)

    # Register blueprint
    from .routes import quiz_bp
    app.register_blueprint(quiz_bp)

    # Import models to ensure they are registered with the app
    from . import models

    with app.app_context():
        db.create_all()

    return app

app = create_app()
