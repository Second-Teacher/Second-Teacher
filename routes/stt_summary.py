from flask import Blueprint, request, jsonify, session
from services.auth import auth_required
from firebase_admin import firestore

stt_summary_bp = Blueprint('stt_summary', __name__)

@stt_summary_bp.route('/summary/api/save', methods=['POST'])
@auth_required
def save_stt_summary():
    """STT 변환 결과 저장 API"""
    try:
        # 사용자 UID 가져오기
        user = session.get('user', {})
        user_id = user.get('uid')
        
        if not user_id:
            return jsonify({
                "success": False,
                "error": "사용자 인증 정보를 찾을 수 없습니다."
            }), 401
        
        # 요청 데이터 검증
        data = request.get_json()
        if not data or 'file_name' not in data or 'content' not in data or 'type' not in data:
            return jsonify({
                "success": False,
                "error": "필수 데이터가 제공되지 않았습니다."
            }), 400
        
        file_name = data['file_name']
        content = data['content']
        summary_type = data['type']  # 'stt'
        
        if summary_type != 'stt':
            return jsonify({
                "success": False,
                "error": "유효하지 않은 요약 유형입니다."
            }), 400
        
        # Firestore에 STT 변환 결과 저장
        db = firestore.client()
        
        # stt/UID/{user_id}/{file_name} 경로에 문서 생성 및 저장
        summary_doc_ref = db.collection("stt").document('UID').collection(user_id).document(file_name)
        
        summary_doc_ref.set({
            'summary': content,
            'created_at': firestore.SERVER_TIMESTAMP,
            'file_name': file_name
        })
        
        return jsonify({
            "success": True,
            "message": "변환 내용이 저장되었습니다."
        })
        
    except Exception as e:
        import traceback
        error_message = f"STT 변환 결과 저장 중 오류 발생: {str(e)}\n{traceback.format_exc()}"
        print(error_message)
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500