from flask import Blueprint, render_template, request, jsonify
from services.audio_service import AudioService
from utils.file_utils import validate_file_request, ALLOWED_AUDIO_EXTENSIONS

audio_bp = Blueprint('audio', __name__)

@audio_bp.route('/audio')
def audio_page():
    """
    오디오 업로드 페이지 렌더링
    """
    return render_template('audio_uploader.html') 