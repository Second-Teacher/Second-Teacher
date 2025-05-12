---
Date_of_creation: 2025-05-08 목 23:32:28
Last_modified:
  - 2025-05-08 목 23:40:03
  - 2025-05-11 일 15:30:00
aliases:
  - Second Teacher 백엔드 실행 및 사용법 가이드
tags: 
Reference: 
---
# 1. 📁 프로젝트 실행 준비
---
## 🔧 요구 사항
---
- Python 3.8+
- `ffmpeg` 설치 필요 (Whisper용)
- Firebase 서비스 계정 JSON 키 파일

## 📦 설치 명령어
---
```bash
# 1. 의존성 설치
pip install -r requirements.txt

# 2. ffmpeg 설치 (Windows 환경)
winget install ffmpeg
```

## 🔧 ffmpeg 환경 변수 설정
---
ffmpeg 설치 후에는 시스템 환경 변수 PATH에 ffmpeg 경로를 추가해야 합니다.

### Windows 환경에서 설정하는 방법
1. 시작 메뉴를 클릭하고 "환경 변수"를 검색한 후 "시스템 환경 변수 편집"을 선택합니다.
2. "환경 변수" 버튼을 클릭합니다.
3. "시스템 변수" 섹션에서 "Path" 변수를 찾아 선택한 후 "편집" 버튼을 클릭합니다.
4. "새로 만들기" 버튼을 클릭하고 ffmpeg가 설치된 경로를 추가합니다.
   - 일반적으로 `C:\Program Files\ffmpeg\bin` 또는 
   - winget으로 설치한 경우 `C:\Users\<사용자명>\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-<버전>-full_build\bin`
5. "확인" 버튼을 모두 클릭하여 창을 닫습니다.
6. 명령 프롬프트를 열고 `ffmpeg -version` 명령으로 설치 및 환경 변수 설정이 제대로 되었는지 확인합니다.

### 대안: 코드에서 직접 FFmpeg 경로 설정
환경 변수 설정이 어려운 경우, `services/audio_service.py` 파일 상단에 다음 코드를 추가하여 프로그램 실행 시 FFmpeg 경로를 환경 변수에 추가할 수 있습니다:

```python
# FFmpeg 경로를 환경 변수에 추가
import os
os.environ["PATH"] += os.pathsep + r"C:\path\to\ffmpeg\bin" 
# 실제 ffmpeg 경로로 변경하세요
```

## 📂 디렉토리 구성
---
```
second-teacher-backend/
├── app.py                               # 애플리케이션 진입점, 라우트 등록 및 설정
├── requirements.txt                     # 프로젝트 의존성 패키지 목록
├── firebase-auth.json                   # Firebase 인증 키 파일
├── routes/                              # 라우트 정의 모듈 
│   ├── auth.py                          # 인증 관련 라우트
│   ├── dashboard.py                     # 대시보드 라우트
│   ├── pdf_summarizer.py                # PDF 요약 관련 라우트
│   ├── profile.py                       # 사용자 프로필 관련 라우트 
│   ├── public.py                        # 공개 페이지 라우트
│   ├── stt_generate_route.py            # STT 변환 및 문제 생성 라우트
│   ├── stt_route.py                     # STT 변환 라우트
│   └── summary_viewer.py                # 요약 내용 조회 라우트
├── services/                            # 비즈니스 로직 서비스 모듈
│   ├── audio_service.py                 # Whisper를 활용한 오디오 처리 서비스
│   ├── auth.py                          # 인증 미들웨어 및 관련 서비스
│   ├── firebase_service.py              # Firebase 연동 서비스
│   ├── gemini_service.py                # Gemini AI 연동 서비스
│   ├── question_generator.py            # 문제 생성 서비스
│   └── __init__.py                      # 패키지 초기화 파일
├── repositories/                        # 데이터 접근 계층 모듈
│   └── user_repository.py               # 사용자 데이터 관리 레포지토리
├── utils/                               # 유틸리티 모듈
│   ├── file_utils.py                    # 파일 검증 및 처리 유틸리티
│   └── __init__.py                      # 패키지 초기화 파일
├── templates/                           # HTML 템플릿 파일
├── static/                              # 정적 자원 파일 (JS, CSS 등)
├── config/                              # 애플리케이션 설정 모듈
│   └── settings.py                      # 환경 설정 관리
├── decorators/                          # 데코레이터 모듈
└── docs/                                # 프로젝트 문서
    ├── Backend Workflow.md              # 백엔드 워크플로우 설명
    └── Second Teacher Backend Guide.md  # 백엔드 가이드
```

# 2. ▶️ 서버 실행 방법
---
```bash
python app.py
```

실행 후 접속 주소:
[http://127.0.0.1:5000/](http://127.0.0.1:5000/)

# 3. 🧪 주요 API 사용법
---
## 🔉 1. STT + 문제 생성 + 저장
---
- **POST /api/stt-generate**
- `multipart/form-data`
  - `file`: 음성 파일
  - `lecture_id`: 강의 ID

```bash
curl -X POST http://127.0.0.1:5000/api/stt-generate \
  -F "file=@example.wav" \
  -F "lecture_id=lecture_001"
```

## 🔁 2. STT만 요청
---
- **POST /api/stt**
- `file`: 음성파일
- 텍스트만 반환

```bash
curl -X POST http://127.0.0.1:5000/api/stt \
  -F "file=@example.wav"
```

## 📄 3. PDF 요약
---
- **POST /pdf/api/summarize**
- `pdf_file`: PDF 파일
- `prompt_option`: 요약 방식 (1 또는 2)

```bash
curl -X POST http://127.0.0.1:5000/pdf/api/summarize \
  -F "pdf_file=@document.pdf" \
  -F "prompt_option=1"
```

# 4. 📦 Firestore 저장 구조
---
```
lectures/
└── lecture_001/
    └── questions/
        └── {자동 생성된 문제 ID}/
            ├── type
            ├── question
            ├── options
            └── answer
```

# 5. ⚠️ 주의 사항
---

| 항목 | 설명 |
|------|------|
| Firebase | `firebase-auth.json` 필요 |
| 음성파일 | mp3, wav, m4a, ogg 형식 지원 |
| FFmpeg | 오디오 변환을 위해 필수 설치, 환경 변수 PATH에 등록 필요 |
| 오류 처리 | 음질 낮으면 빈 결과 반환 가능 |
| 임시 파일 | 모든 업로드 파일은 시스템 임시 폴더에 저장 후 자동 삭제됨 |
