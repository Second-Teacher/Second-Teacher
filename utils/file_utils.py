# 오디오 파일 확장자 지원
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'm4a', 'ogg', 'aac'}

def is_allowed_audio_file(filename):
    """
    파일명을 확인하여 지원되는 오디오 파일인지 확인
    
    Args:
        filename (str): 확인할 파일명
        
    Returns:
        bool: 지원되는 오디오 파일 확장자인 경우 True
    """
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_AUDIO_EXTENSIONS

def validate_file_request(request, file_key='file', required_extensions=None, lecture_id_required=False):
    """
    파일 업로드 요청을 검증하는 공통 함수
    
    Args:
        request: Flask 요청 객체
        file_key (str): 파일이 저장된 요청 키 이름
        required_extensions (set): 허용된 파일 확장자 집합 (None인 경우 확장자 검사 안함)
        lecture_id_required (bool): lecture_id가 필요한지 여부
    
    Returns:
        tuple: (성공 여부, 파일 객체 또는 오류 메시지, 상태 코드)
    """
    # lecture_id 검증 (필요한 경우)
    if lecture_id_required and 'lecture_id' not in request.form:
        return False, {"error": "lecture_id가 필요합니다."}, 400
    
    # 파일 존재 확인
    if file_key not in request.files:
        return False, {"error": "파일이 없습니다."}, 400
    
    file = request.files[file_key]
    
    # 파일명 확인
    if file.filename == '':
        return False, {"error": "선택된 파일이 없습니다."}, 400
    
    # 확장자 검증 (필요한 경우)
    if required_extensions:
        if not ('.' in file.filename and file.filename.rsplit('.', 1)[1].lower() in required_extensions):
            extensions_str = ', '.join(required_extensions)
            return False, {"error": f"지원되지 않는 파일 형식입니다. (지원 형식: {extensions_str})"}, 400
    
    # 모든 검증 통과
    return True, file, 200 