from flask import Blueprint, request, jsonify
import os
from services.audio_service import AudioService
from werkzeug.utils import secure_filename
import tempfile
from utils.file_utils import is_allowed_audio_file, validate_file_request, ALLOWED_AUDIO_EXTENSIONS

stt_bp = Blueprint('stt', __name__)
audio_service = AudioService()

@stt_bp.route('/api/stt', methods=['POST'])
def stt():
    # 파일 요청 검증
    is_valid, result, status_code = validate_file_request(
        request, 
        file_key='file', 
        required_extensions=ALLOWED_AUDIO_EXTENSIONS
    )
    
    if not is_valid:
        return jsonify(result), status_code
    
    # 검증 통과 시 file 객체를 가져옴
    file = result
    
    try:
        result = audio_service.transcribe_audio(file)
        if result['success']:
            return jsonify({
                "success": True,
                "transcription": result['text']
            })
        else:
            return jsonify({"error": result['error']}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
