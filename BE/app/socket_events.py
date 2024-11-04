from flask_socketio import emit
from . import socketio

@socketio.on('join_quiz')
def handle_join_quiz(data):
    quiz_id = data['quiz_id']
    emit('joined_quiz', {'message': f'Player joined quiz {quiz_id}'}, broadcast=True)

@socketio.on('submit_answer')
def handle_submit_answer(data):
    player_id = data['player_id']
    question_id = data['question_id']
    answer_id = data['answer_id']
    # Save answer to the database or process it as needed
    emit('answer_received', {'player_id': player_id, 'question_id': question_id, 'answer_id': answer_id}, broadcast=True)