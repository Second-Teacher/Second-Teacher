from services.gemini_service import GeminiService

def generate_question(text):
    """
    Gemini API를 사용하여 주어진 텍스트로부터 문제를 생성
    
    Args:
        text (str): 문제를 생성할 텍스트
        
    Returns:
        dict: 생성된 문제 정보
    """
    try:
        # 텍스트가 비어있는지 확인
        if not text or len(text.strip()) == 0:
            return None
            
        # Gemini 서비스 초기화
        gemini_service = GeminiService()
        
        # Gemini API를 사용하여 문제 생성
        questions = gemini_service.generate_question(text)
        
        if not questions:
            return None
            
        # 생성된 문제 반환
        return questions
            
    except Exception as e:
        print(f"Error generating question: {str(e)}")
        return None
