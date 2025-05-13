from flask import Flask, jsonify
from routes.stt_route import stt_bp
from routes.stt_generate_route import stt_gen_bp
from routes.auth import auth_bp
from routes.public import public_bp
from routes.dashboard import dashboard_bp
from routes.pdf_summarizer import pdf_bp as pdf
from routes.audio_uploader import audio_bp as audio
import os
from dotenv import load_dotenv
from services.firebase_service import db
from config.settings import configure_app
from routes.profile import profile_bp
from routes.summary_viewer import summary_bp
from routes.stt_summary import stt_summary_bp

# Load environment variables
load_dotenv()

app = Flask(__name__)
configure_app(app)

# Register blueprints
app.register_blueprint(stt_bp)
app.register_blueprint(stt_gen_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(public_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(pdf)
app.register_blueprint(profile_bp)
app.register_blueprint(summary_bp)
app.register_blueprint(audio)
app.register_blueprint(stt_summary_bp)

# Firebase config endpoint
@app.route('/api/firebase-config')
def get_firebase_config():
    # 이 정보들은 public하게 공개해도 됩니다 (Firebase 보안 규칙으로 보호됨)
    config = {
        "apiKey": os.getenv('FIREBASE_API_KEY'),
        "authDomain": os.getenv('FIREBASE_AUTH_DOMAIN'),
        "projectId": os.getenv('FIREBASE_PROJECT_ID'),
        "storageBucket": os.getenv('FIREBASE_STORAGE_BUCKET'),
        "messagingSenderId": os.getenv('FIREBASE_MESSAGING_SENDER_ID'),
        "appId": os.getenv('FIREBASE_APP_ID')
    }
    return jsonify(config)

if __name__ == '__main__':
    app.run(debug=True)
