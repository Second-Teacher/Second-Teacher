from firebase_admin import firestore

class UserRepository:
    def __init__(self):
        self.db = firestore.client()
        self.collection = self.db.collection('users')
    
    def exists(self, user_id):
        """사용자 문서 존재 여부 확인"""
        doc = self.collection.document(user_id).get()
        return doc.exists
    
    def create(self, user_id, email):
        """새 사용자 문서 생성"""
        user_data = {
            'email': email,
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        self.collection.document(user_id).set(user_data)
    
    def pdf_exists(self, user_id):
        """pdf/UID 컬렉션에 사용자 uid 문서 존재 여부 확인"""
        # 먼저 UID 문서가 있는지 확인
        uid_ref = self.db.collection('pdf').document('UID')
        uid_doc = uid_ref.get()
        
        if not uid_doc.exists:
            # UID 문서가 없으면 생성
            uid_ref.set({})
            return False
        
        # 사용자 문서 존재 여부 확인 - 문서가 있는지 직접 확인
        user_pdf_ref = self.db.collection('pdf').document('UID').collection(user_id).document(user_id)
        user_pdf_doc = user_pdf_ref.get()
        
        return user_pdf_doc.exists
    
    def create_pdf_document(self, user_id):
        """pdf/UID 컬렉션에 사용자 uid 이름의 빈 문서 생성"""
        user_pdf_ref = self.db.collection('pdf').document('UID').collection(user_id).document(user_id)
        user_pdf_ref.set({})
        print(f"Created empty document at pdf/UID/{user_id}/{user_id}")


    def update_nickname(self, user_id, nickname):
         """사용자 닉네임 업데이트"""
         self.collection.document(user_id).update({
         'nickname': nickname
         })
         return True
    
    def delete(self, user_id):
        """사용자 문서 삭제"""
        self.collection.document(user_id).delete()
        print(f"User document deleted for {user_id}")

    def delete_pdf_document(self, user_id):
        """사용자 PDF 문서 삭제"""
        # 사용자 PDF 컬렉션의 모든 문서 가져오기
        user_pdf_collection = self.pdf_collection.document('UID').collection(user_id)
        docs = user_pdf_collection.stream()
        
        # 컬렉션 내의 모든 문서 삭제
        for doc in docs:
            doc.reference.delete()
            print(f"Deleted document: {doc.id} from pdf/UID/{user_id}")
        
        print(f"PDF documents deleted for user {user_id}")

    def delete_user_data(self, user_id):
        """사용자 관련 모든 데이터 삭제"""
        # 1. 사용자 문서 삭제
        self.delete(user_id)
        
        # 2. PDF 문서 삭제
        self.delete_pdf_document(user_id)
        
        print(f"All data for user {user_id} has been deleted")