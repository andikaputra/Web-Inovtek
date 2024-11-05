from flask import Blueprint, request,send_from_directory, abort,send_file, jsonify, current_app
from .models import db, SoalJenis, Waktu, QuizKode, Soal, SoalJawaban
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError  # Import IntegrityError
from datetime import datetime
from werkzeug.utils import secure_filename
import os
import json

quiz_bp = Blueprint('quiz', __name__)

CORS(quiz_bp)

@quiz_bp.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Welcome to the Quiz API"}), 200

# =================================QUIZ CODE==========================================================
# CREATE
@quiz_bp.route('/quiz_kode', methods=['POST'])
def create_quiz_kode():
    data = request.get_json()
    new_quiz_kode = QuizKode(
        kode=data['kode'],
        created_at=datetime.utcnow()
    )
    db.session.add(new_quiz_kode)
    db.session.commit()
    return jsonify({'message': 'QuizKode created successfully', 'data': data}), 201

# READ (GET ALL)
@quiz_bp.route('/quiz_kode', methods=['GET'])
def get_quiz_kode():
    quiz_kodes = QuizKode.query.filter_by(deleted_at=None).all()
    output = []
    for quiz in quiz_kodes:
        quiz_data = {'id': quiz.id, 'kode': quiz.kode, 'created_at': quiz.created_at, 'updated_at': quiz.updated_at}
        output.append(quiz_data)
    return jsonify({'data': output}), 200

# READ (GET BY ID)
@quiz_bp.route('/quiz_kode/<int:id>', methods=['GET'])
def get_quiz_kode_by_id(id):
    quiz = QuizKode.query.filter_by(id=id, deleted_at=None).first()
    if not quiz:
        return jsonify({'message': 'QuizKode not found'}), 404
    quiz_data = {'id': quiz.id, 'kode': quiz.kode, 'created_at': quiz.created_at, 'updated_at': quiz.updated_at}
    return jsonify({'data': quiz_data}), 200

# UPDATE
@quiz_bp.route('/quiz_kode/<int:id>', methods=['PUT'])
def update_quiz_kode(id):
    data = request.get_json()
    quiz = QuizKode.query.filter_by(id=id, deleted_at=None).first()
    if not quiz:
        return jsonify({'message': 'QuizKode not found'}), 404
    quiz.kode = data.get('kode', quiz.kode)
    quiz.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'QuizKode updated successfully'}), 200

# DELETE
@quiz_bp.route('/quiz_kode/<int:id>', methods=['DELETE'])
def delete_quiz_kode(id):
    quiz = QuizKode.query.filter_by(id=id, deleted_at=None).first()
    if not quiz:
        return jsonify({'message': 'QuizKode not found'}), 404
    quiz.deleted_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'QuizKode deleted successfully'}), 200

# =====================================SOAL JENIS==========================================================

@quiz_bp.route('/soal_jenis', methods=['GET'])
def get_soal_jenis():
    # Mendapatkan semua data dari tabel SoalJenis
    soalJenis = SoalJenis.query.all()
    # Memformat data dalam bentuk JSON
    data = [{"id": sj.id, "nama": sj.nama} for sj in soalJenis]
    return jsonify({"data": data}), 200

# =====================================WAKTU===========================================================
@quiz_bp.route('/waktu', methods=['GET'])
def get_waktu():
    # Mendapatkan semua data dari tabel SoalJenis
    waktu = Waktu.query.all()
    # Memformat data dalam bentuk JSON
    data = [{"id": wk.id, "nama": wk.nama, "detik": wk.detik} for wk in waktu]
    return jsonify({"data": data}), 200
