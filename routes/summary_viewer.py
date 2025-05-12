from flask import Blueprint, render_template, jsonify, session, request
from services.auth import auth_required
from firebase_admin import firestore

# 새로운 Blueprint 생성
summary_bp = Blueprint('summary', __name__, url_prefix='/summary')

@summary_bp.route('/viewer')
@auth_required
def viewer():
    """요약 내용 보기 페이지 (PDF/STT/추후 추가 가능)"""
    return render_template('summary_viewer.html')

@summary_bp.route('/api/summaries', methods=['GET', 'POST'])
@auth_required
def manage_summaries():
    """요약 내용 조회 및 수정 API"""
    try:
        # 사용자 정보 가져오기 (공통 부분)
        user = session.get('user', {})
        user_id = user.get('uid')
        
        if not user_id:
            return jsonify({"success": False, "error": "로그인이 필요합니다."}), 401
        
        # Firestore 클라이언트 초기화 (공통 부분)
        db = firestore.client()
        
        # HTTP 메소드에 따라 분기
        if request.method == 'GET':
            # 요약 목록 조회 로직
            summary_type = request.args.get('type', 'pdf')
            
            if summary_type not in ['pdf', 'stt']:
                return jsonify({"success": False, "error": "유효하지 않은 요약 유형입니다."}), 400
            
            # 파이어스토어에서 데이터 가져오기
            collection_ref = db.collection(summary_type).document('UID').collection(user_id)
            docs = collection_ref.get()
            
            result = {}
            for doc in docs:
                doc_data = doc.to_dict()
                if 'summary' in doc_data:
                    result[doc.id] = doc_data['summary']
            
            return jsonify({
                "success": True, 
                "summaries": result,
                "type": summary_type
            })
            
        elif request.method == 'POST':
            # 요약 내용 수정 로직
            data = request.get_json()
            if not data or 'type' not in data or 'fileName' not in data or 'content' not in data:
                return jsonify({"success": False, "error": "필수 데이터가 누락되었습니다."}), 400
            
            summary_type = data['type']
            file_name = data['fileName']
            content = data['content']
            
            if summary_type not in ['pdf', 'stt']:
                return jsonify({"success": False, "error": "유효하지 않은 요약 유형입니다."}), 400
            
            # 문서 참조 가져오기
            doc_ref = db.collection(summary_type).document('UID').collection(user_id).document(file_name)
            
            # 내용 업데이트 (PDF와 STT 동일하게 처리)
            doc_ref.update({
                'summary': content,
                'updated_at': firestore.SERVER_TIMESTAMP
            })
            
            return jsonify({
                "success": True,
                "message": "요약 내용이 성공적으로 업데이트되었습니다."
            })
        
    except Exception as e:
        error_message = f"요약 {'조회' if request.method == 'GET' else '업데이트'} 중 오류가 발생했습니다: {str(e)}"
        print(error_message)
        return jsonify({"success": False, "error": error_message}), 500