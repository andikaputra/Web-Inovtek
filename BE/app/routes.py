from flask import Blueprint, request,send_from_directory, abort,send_file, jsonify, current_app
from .models import db, SoalJenis, Waktu, QuizKode, Soal, SoalJawaban, Peserta, PesertaNilai
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError  # Import IntegrityError
from sqlalchemy.orm import joinedload
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

# READ (GET BY Kode)
@quiz_bp.route('/quiz/kode', methods=['GET'])
def get_quiz_kode_by_kode():
    kode = request.args.get('kode')
    
    if not kode:
        return jsonify({'error': 'Kode tidak disediakan'}), 400

    quiz = QuizKode.query.filter_by(kode=kode, deleted_at=None).first()
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

# ======================================SOAL==========================================================


# Tentukan folder penyimpanan file
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
  
def allowed_file(filename):
    """Memeriksa apakah file memiliki ekstensi yang diizinkan."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@quiz_bp.route('/soal', methods=['POST'])
def upload_file():
    # Mengambil data dari form request
    id_quiz_kode = request.form['id_quiz_kode']
    id_soal_jenis = request.form['id_soal_jenis']
    id_waktu = request.form['id_waktu']
    pertanyaan = request.form['pertanyaan']
    layout = request.form['layout']
    file_path = None
    jenis_file = None

    # Memeriksa apakah file ada dalam request
    if 'file' in request.files:
        file = request.files['file']
        filename = secure_filename(file.filename)
        
        # Gunakan current_app untuk mengakses konfigurasi app
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Menentukan jenis file dari nama file
        jenis_file = filename.rsplit('.', 1)[1].lower()
    
    # Menyimpan data ke database
    new_soal = Soal(
        id_quiz_kode=id_quiz_kode,
        id_soal_jenis=id_soal_jenis,
        id_waktu=id_waktu,
        pertanyaan=pertanyaan,
        file=file_path,
        jenis_file=jenis_file,
        layout=layout,
        created_at=datetime.utcnow()
    )
    
    db.session.add(new_soal)
    db.session.commit()

    # Ambil data dari answersQuiz
    index = 0

    # Mengambil semua data dari form
    while True:
        answer_data = request.form.get(f'answers[{index}]')
        if answer_data is None:
            break  # Keluar dari loop jika tidak ada data untuk indeks ini

        # Konversi JSON string ke Python dictionary
        answer_object = json.loads(answer_data)

        # Cek dan simpan file jawaban jika ada
        file_jawaban_path = None 
        if f'file_{index}' in request.files:
            file_jawaban = request.files[f'file_{index}']
            filename_jawaban = secure_filename(file_jawaban.filename)
            
            # Path untuk menyimpan file jawaban
            file_jawaban_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename_jawaban)
            file_jawaban.save(file_jawaban_path)
            
            # Simpan path file ke text_jawaban jika ada file
            text_jawaban = file_jawaban_path
        else:
            # Jika tidak ada file, simpan teks biasa dari `answer_object['text']`
            text_jawaban = answer_object['text']

        # Membuat entri jawaban di database
        new_jawaban = SoalJawaban(
            id_soal=new_soal.id,
            text_jawaban=text_jawaban,
            correct=answer_object['correct'],
            bobot=1 if answer_object['correct'] else 0
        )
        
        db.session.add(new_jawaban)
        db.session.commit()
        index += 1

    return jsonify({'success': 'File uploaded successfully'}), 200


@quiz_bp.route('/soal/<int:id>', methods=['DELETE'])
def delete_soal(id):
    # Mencari soal berdasarkan ID
    soal = Soal.query.get(id)
    
    # Jika soal tidak ditemukan
    if not soal:
        return jsonify({'error': 'Soal not found'}), 404
    
    # Hapus semua jawaban yang terkait dengan soal ini
    SoalJawaban.query.filter_by(id_soal=id).delete()

    # Menghapus soal dari database
    db.session.delete(soal)
    db.session.commit()
    
    return jsonify({'message': 'Soal deleted successfully'}), 200

@quiz_bp.route('/soal/<int:id_quiz_kode>', methods=['GET'])
def get_soal_by_quiz_kode(id_quiz_kode):
    # Mendapatkan semua soal berdasarkan id_quiz_kode
    soals = Soal.query.filter_by(id_quiz_kode=id_quiz_kode).all()
    
    # Jika tidak ada soal ditemukan
    if not soals:
        return jsonify({'error': 'No questions found for the specified quiz code'}), 404
    
    # Membuat respons dengan struktur JSON yang mencakup soal dan jawabannya
    soal_data = []
    for soal in soals:
        jawaban_data = []
        for jawaban in soal.soal_jawaban:
            jawaban_data.append({
                'id': jawaban.id,
                'text_jawaban': jawaban.text_jawaban,
                'correct': jawaban.correct,
                'bobot': jawaban.bobot,
                'created_at': jawaban.created_at,
                'updated_at': jawaban.updated_at,
                'deleted_at': jawaban.deleted_at
            })
        
        soal_data.append({
            'id': soal.id,
            'id_quiz_kode': soal.id_quiz_kode,
            'id_soal_jenis': soal.id_soal_jenis,
            'id_waktu': soal.id_waktu,
            'pertanyaan': soal.pertanyaan,
            'file': soal.file,
            'jenis_file': soal.jenis_file,
            'layout': soal.layout,
            'created_at': soal.created_at,
            'updated_at': soal.updated_at,
            'deleted_at': soal.deleted_at,
            'jawaban': jawaban_data  # Menyertakan data jawaban terkait
        })
    
    return jsonify(soal_data), 200
 

@quiz_bp.route('/soal/ujian/<int:id_quiz_kode>/<int:offset>', methods=['GET'])
def get_soal_ujian_by_quiz_kode(id_quiz_kode, offset=0):
    # Query untuk mengambil soal dan waktu terkait
    soal = Soal.query.filter_by(
        id_quiz_kode=id_quiz_kode,
        deleted_at=None  # Memastikan hanya data yang belum dihapus
    ).options(
        joinedload(Soal.soal_jawaban),  # Memuat soal_jawaban
        joinedload(Soal.waktu)  # Memuat waktu yang berelasi dengan soal
    ).limit(1).offset(offset).first()

    # Jika data soal ditemukan, kembalikan dalam format JSON
    if soal:
        return jsonify({
            "id": soal.id,
            "id_quiz_kode": soal.id_quiz_kode,
            "id_soal_jenis": soal.id_soal_jenis,
            "id_waktu": soal.id_waktu,
            "waktu": {
                "id": soal.waktu.id,
                "nama": soal.waktu.nama,
                "detik": soal.waktu.detik
            } if soal.waktu else None,
            "pertanyaan": soal.pertanyaan,
            "file": soal.file,
            "jenis_file": soal.jenis_file,
            "layout": soal.layout,
            "created_at": soal.created_at,
            "updated_at": soal.updated_at,
            "deleted_at": soal.deleted_at,
            "soal_jawaban": [
                {
                    "id": jawaban.id,
                    "text_jawaban": jawaban.text_jawaban,
                    "correct": jawaban.correct,
                    "bobot": jawaban.bobot
                }
                for jawaban in soal.soal_jawaban
            ]
        })
    else:
        return jsonify({"error": "Soal not found or deleted"}), 404



@quiz_bp.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    # Cek apakah file ada di folder yang ditentukan
    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(file_path):
        abort(404, description="File not found")

    # Kirim file ke klien
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)

# Example for inline view without download
@quiz_bp.route('/view/<filename>', methods=['GET'])
def view_file(filename):
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'upload')
    current_app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    if not os.path.exists(file_path):
        abort(404, description="File not found")

    return send_file(file_path)
 
 # ===============================PESERTA==============================================
@app.route('/peserta', methods=['GET'])
def get_single_peserta_by_kode():
    kode = request.args.get('kode')
    
    if not kode:
        return jsonify({'error': 'Kode tidak disediakan'}), 400

    # Query untuk mencari satu peserta berdasarkan kode_unik dan deleted_at is null
    peserta = Peserta.query.filter_by(kode_unik=kode, deleted_at=None).first()
    
    if not peserta:
        return jsonify({'message': 'Peserta tidak ditemukan'}), 404

    # Serialisasi data peserta
    peserta_data = {
        'id': peserta.id,
        'id_quiz_kode': peserta.id_quiz_kode,
        'kode_unik': peserta.kode_unik,
        'created_at': peserta.created_at,
        'updated_at': peserta.updated_at,
        'deleted_at': peserta.deleted_at,
        # tambahkan field lain sesuai model Anda
    }

    return jsonify({'peserta': peserta_data}), 200