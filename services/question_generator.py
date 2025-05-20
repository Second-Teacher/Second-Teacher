def generate_question(text):
    """
    주어진 텍스트로부터 문제를 생성
    
    Args:
        text (str): 문제를 생성할 텍스트
        
    Returns:
        dict: 생성된 문제 정보
    """
    try:
        # 텍스트가 비어있는지 확인
        if not text or len(text.strip()) == 0:
            return None
            
        # 텍스트를 문장 단위로 분리
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if not sentences:
            return None
            
        # 첫 번째 문장을 문제로 사용
        question_text = sentences[0]
        
        # 문제 유형 결정 (주관식 또는 객관식)
        if len(sentences) >= 3:  # 충분한 문장이 있는 경우 객관식
        return {
            "type": "객관식",
                "question": f"{question_text}에 대한 설명으로 옳은 것은?",
            "options": [
                    sentences[0] if len(sentences) > 0 else "첫 번째 설명",
                    sentences[1] if len(sentences) > 1 else "두 번째 설명",
                    sentences[2] if len(sentences) > 2 else "세 번째 설명",
                    "위의 설명 중 옳은 것이 없다."
                ],
                "answer": 0  # 첫 번째 문장이 정답
            }
        else:  # 문장이 부족한 경우 주관식
            return {
                "type": "주관식",
                "question": f"{question_text}에 대해 설명하시오.",
                "answer": question_text
        }
            
    except Exception as e:
        print(f"Error generating question: {str(e)}")
        return None
