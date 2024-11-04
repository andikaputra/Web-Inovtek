from flask import Blueprint, request, jsonify
# from .models import db, Quiz, Question, Answer

quiz_bp = Blueprint('quiz', __name__)

@quiz_bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to the Quiz API"}), 200

# @quiz_bp.route('/admin/quizzes', methods=['POST'])
# def create_quiz():
#     data = request.get_json()
#     new_quiz = Quiz(kode=data['kode'])
#     db.session.add(new_quiz)
#     db.session.commit()
#     return jsonify({"message": "Quiz created", "quiz_id": new_quiz.id}), 201

# @quiz_bp.route('/admin/quizzes/<int:quiz_id>/questions', methods=['POST'])
# def add_question(quiz_id):
#     data = request.get_json()
#     new_question = Question(quiz_id=quiz_id, text=data['text'])
#     db.session.add(new_question)
#     db.session.commit()
#     return jsonify({"message": "Question added", "question_id": new_question.id}), 201

# @quiz_bp.route('/quizzes/<int:quiz_id>', methods=['GET'])
# def get_quiz(quiz_id):
#     quiz = Quiz.query.get(quiz_id)
#     questions = [{"id": q.id, "text": q.text} for q in quiz.questions]
#     return jsonify({"kode": quiz.kode, "questions": questions}), 200
