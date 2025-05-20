import os
import whisper
import tempfile
from pathlib import Path
import torch

class AudioService:
    def __init__(self, model_size="base"):
        """
        AudioService 초기화
        Args:
            model_size (str): Whisper 모델 크기 ("tiny", "base", "small", "medium", "large")
        """
        # CUDA가 사용 가능하면 사용, 아니면 CPU로 설정
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # 메모리 사용량 최적화
        if self.device == "cpu":
            torch.set_num_threads(4)  # CPU 스레드 제한
        
        # 작은 모델 크기 사용
        self.model = whisper.load_model(model_size, device=self.device)
    
    def transcribe_audio(self, audio_file):
        """
        오디오 파일을 텍스트로 변환
        Args:
            audio_file: 업로드된 오디오 파일 객체
        Returns:
            dict: 변환 결과
            {
                "success": bool,
                "text": str (성공 시),
                "error": str (실패 시)
            }
        """
        try:
            # 임시 파일로 저장
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                audio_file.save(temp_file.name)
                temp_path = temp_file.name
            
            # Whisper로 음성 인식
            result = self.model.transcribe(temp_path)
            
            # 임시 파일 삭제
            os.unlink(temp_path)
            
            return {
                "success": True,
                "text": result["text"]
            }
            
        except Exception as e:
            # 에러 발생 시 임시 파일 정리
            if 'temp_path' in locals():
                try:
                    os.unlink(temp_path)
                except:
                    pass
            
            return {
                "success": False,
                "error": f"오디오 변환 중 오류가 발생했습니다: {str(e)}"
            } 