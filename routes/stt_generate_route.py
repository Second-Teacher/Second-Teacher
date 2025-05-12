from flask import Blueprint, request, jsonify
import os
from services.audio_service import AudioService
from services.question_generator import generate_question
from services.firebase_service import save_question
from werkzeug.utils import secure_filename
from utils.file_utils import is_allowed_audio_file, validate_file_request, ALLOWED_AUDIO_EXTENSIONS

stt_gen_bp = Blueprint('stt_gen', __name__)
audio_service = AudioService()

@stt_gen_bp.route('/api/stt-generate', methods=['POST'])
def stt_generate():
    # 파일 요청 검증
    is_valid, result, status_code = validate_file_request(
        request, 
        file_key='file', 
        required_extensions=ALLOWED_AUDIO_EXTENSIONS,
        lecture_id_required=True
    )
    
    if not is_valid:
        return jsonify(result), status_code
    
    # 검증 통과 시 file 객체를 가져옴
    file = result
    lecture_id = request.form['lecture_id']

    try:
        # 오디오 파일을 텍스트로 변환
        result = audio_service.transcribe_audio(file)
        if not result['success']:
            return jsonify({"error": result['error']}), 500

        # 문제 생성 및 저장
        question = generate_question(result['text'])
        save_question(lecture_id, question)

        return jsonify({
            "success": True,
            "text": result['text'],
            "question": question
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
