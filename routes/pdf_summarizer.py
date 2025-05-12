from flask import Blueprint, render_template, request, jsonify, session
from services.auth import auth_required  # 데코레이터 경로를 services로 변경
from services.gemini_service import GeminiService
from firebase_admin import firestore
from utils.file_utils import validate_file_request


pdf_bp = Blueprint('pdf', __name__)
gemini_service = GeminiService()

# PDF 파일 확장자
PDF_EXTENSIONS = {'pdf'}

@pdf_bp.route('/summarizer')
@auth_required
def summarizer():
    """PDF 요약 페이지 렌더링"""
    return render_template('pdf_summarizer.html')

@pdf_bp.route('/api/summarize', methods=['POST'])
@auth_required
def summarize():
    """PDF 업로드 및 요약 API"""
    try:
        # 파일 요청 검증
        is_valid, result, status_code = validate_file_request(
            request, 
            file_key='pdf_file', 
            required_extensions=PDF_EXTENSIONS
        )
        
        if not is_valid:
            return jsonify({"success": False, "error": result["error"]}), status_code
        
        # 검증 통과 시 file 객체를 가져옴
        pdf_file = result
        
        # 프롬프트 옵션 가져오기
        prompt_option = request.form.get('prompt_option', '1')
        try:
            prompt_option = int(prompt_option)
            if prompt_option not in [1, 2]:
                prompt_option = 1
        except ValueError:
            prompt_option = 1
        
        # Gemini 서비스에 PDF 요약 요청
        result = gemini_service.summarize_pdf(pdf_file, prompt_option)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
    
@pdf_bp.route('/api/save', methods=['POST'])
@auth_required
def save_summary():
    """PDF 요약 내용 저장"""
    try:
        # 사용자 UID 가져오기
        user = session.get('user', {})
        user_id = user.get('uid')
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "사용자 인증 정보를 찾을 수 없습니다."
            }), 401
        
        data = request.get_json()
        if not data or 'file_name' not in data or 'summary' not in data:
            return jsonify({
                "success": False,
                "error": "필수 데이터가 제공되지 않았습니다."
            }), 400
        
        file_name = data['file_name']
        summary = data['summary']
        
        # Firestore에 요약 내용 저장
        db = firestore.client()
        
        # pdf/UID/{user_id}/{file_name} 경로에 문서 생성 및 저장
        summary_doc_ref = db.collection('pdf').document('UID').collection(user_id).document(file_name)
        
        summary_doc_ref.set({
            'summary': summary,
            'created_at': firestore.SERVER_TIMESTAMP,
            'file_name': file_name
        })
        
        return jsonify({
            "success": True,
            "message": "요약 내용이 저장되었습니다."
        })
        
    except Exception as e:
        print(f"Error saving summary: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500