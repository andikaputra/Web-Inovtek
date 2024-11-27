from flask import Blueprint, request,send_from_directory, abort,send_file, jsonify, current_app
from .models import db, SoalJenis, Waktu, QuizKode, Soal, SoalJawaban, Peserta, PesertaNilai, PesertaJawaban, Users
from flask_cors import CORS
from sqlalchemy.exc import IntegrityError  # Import IntegrityError
from sqlalchemy.orm import joinedload
from sqlalchemy import func, desc, literal
from sqlalchemy import desc
from datetime import datetime
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
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

    quiz = QuizKode.query.filter_by(kode=kode, mulai=True, deleted_at=None).first()
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

@quiz_bp.route('/quiz_mulai/<int:quiz_id>', methods=['PUT'])
def update_mulai(quiz_id):
    try:
        # Cari QuizKode berdasarkan ID
        quiz = QuizKode.query.filter_by(id=quiz_id, deleted_at=None).first()
        if not quiz:
            return jsonify({'message': 'QuizKode not found'}), 404

        # Update field mulai menjadi True
        quiz.mulai = True
        quiz.updated_at = datetime.utcnow()

        # Simpan perubahan ke database
        db.session.commit()

        return jsonify({'message': 'Quiz updated successfully', 'quiz': {
            'id': quiz.id,
            'kode': quiz.kode,
            'mulai': quiz.mulai,
            'updated_at': quiz.updated_at
        }}), 200

    except Exception as e:
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500


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
@quiz_bp.route('/peserta', methods=['GET'])
def get_peserta():
    pes = Peserta.query.filter_by(deleted_at=None).all()
    output = []
    for peserta in pes:
        peserta_data = {
            'id': peserta.id,
            'id_quiz_kode': peserta.id_quiz_kode,
            'kode_unik': peserta.kode_unik,
            'created_at': peserta.created_at,
            'updated_at': peserta.updated_at,
            'deleted_at': peserta.deleted_at,
            # tambahkan field lain sesuai model Anda
        }
        output.append(peserta_data)
    return jsonify({'data': output}), 200


@quiz_bp.route('/peserta/<int:id_quiz_kode>', methods=['GET'])
def get_peserta_by_quiz_kode(id_quiz_kode):
    try:
        # Query to get all participants with the specified id_quiz_kode
        peserta_list = Peserta.query.filter_by(id_quiz_kode=id_quiz_kode, deleted_at=None).all()
        
        # Check if any participants are found
        if not peserta_list:
            return jsonify({'message': 'No participants found for the specified quiz code'}), 404

        # Prepare response data
        peserta_data = []
        for peserta in peserta_list:
            peserta_data.append({
                'id': peserta.id,
                'id_quiz_kode': peserta.id_quiz_kode,
                'kode_unik': peserta.kode_unik,
                'created_at': peserta.created_at,
                'updated_at': peserta.updated_at,
            })

        return jsonify(peserta_data), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'An error occurred while retrieving participants'}), 500


@quiz_bp.route('/peserta', methods=['POST'])
def create_peserta():
    data = request.get_json()

    # Cek jika peserta dengan `id_quiz_kode` dan `kode_unik` sudah ada, tetapi dihapus
    pes = Peserta.query.filter_by(
        id_quiz_kode=data['id_quiz_kode'],
        kode_unik=data['kode_unik'], 
        deleted_at=None
    ).first()
    if pes:
        pes.deleted_at = datetime.utcnow()
        db.session.commit()

    # Buat peserta baru
    new_peserta = Peserta(
        id_quiz_kode=data['id_quiz_kode'],
        kode_unik=data['kode_unik'],
        created_at=datetime.utcnow()
    )
    db.session.add(new_peserta)
    db.session.commit()

    # Ambil data lengkap peserta yang baru saja dibuat untuk ditampilkan
    peserta_data = {
        'id': new_peserta.id,
        'id_quiz_kode': new_peserta.id_quiz_kode,
        'kode_unik': new_peserta.kode_unik,
        'created_at': new_peserta.created_at,
        'deleted_at': new_peserta.deleted_at
    }

    return jsonify({'message': 'Peserta created successfully', 'data': peserta_data}), 200


@quiz_bp.route('/delete_peserta', methods=['DELETE'])
def delete_peserta_by_id_quiz_kode():
    try:
        # Ambil id_quiz_kode dari query parameter
        id_quiz_kode = request.args.get('id_quiz_kode')
        if not id_quiz_kode:
            return jsonify({'message': 'id_quiz_kode is required'}), 400

        # Query semua data dengan id_quiz_kode yang sesuai dan belum di-soft delete
        peserta_to_soft_delete = Peserta.query.filter_by(id_quiz_kode=id_quiz_kode, deleted_at=None).all()
        if not peserta_to_soft_delete:
            return jsonify({'message': f'No Peserta found with id_quiz_kode={id_quiz_kode}'}), 404

        # Soft delete semua data dengan mengisi `deleted_at`
        for peserta in peserta_to_soft_delete:
            peserta.deleted_at = datetime.utcnow()

        db.session.commit()

        return jsonify({'message': f'Successfully soft deleted Peserta with id_quiz_kode={id_quiz_kode}'}), 200
    except Exception as e:
        return jsonify({'message': 'An error occurred', 'error': str(e)}), 500


    # ===============================PESERTA NILAI=============================================PESERTA
@quiz_bp.route('/peserta_nilai/<int:id_peserta>/<int:id_quiz_kode>', methods=['GET'])
def get_peserta_nilai(id_peserta, id_quiz_kode):
    # Query untuk mengambil data peserta_nilai berdasarkan id_peserta, id_quiz_kode, dan deleted_at NULL
    data = PesertaNilai.query.filter_by(
        id_peserta=id_peserta,
        id_quiz_kode=id_quiz_kode,
        deleted_at=None  # Hanya mengambil data yang belum dihapus
    ).first()

    # Jika tidak ditemukan, kembalikan pesan error
    if not data:
        return jsonify({'message': 'Data not found'}), 404

    # Mengonversi data ke dalam format yang bisa dikembalikan sebagai JSON
    nilai_data = {
        'id': data.id,
        'id_quiz_kode': data.id_quiz_kode,
        'id_peserta': data.id_peserta,
        'nilai': data.nilai,  
        'created_at': data.created_at,
        'updated_at': data.updated_at,
        'deleted_at': data.deleted_at
    }

    return jsonify({'message': 'Data retrieved successfully', 'data': nilai_data}), 200

 
@quiz_bp.route('/submit_answers', methods=['POST'])
def submit_answers():
    data = request.get_json()
    id_quiz_kode = data.get('id_quiz_kode')
    id_peserta = data.get('id_peserta')
    answers = data.get('answers', [])

    if not id_quiz_kode or not id_peserta or not answers:
        return jsonify({'error': 'Data tidak lengkap'}), 400

    total_score = 0

    # Loop melalui setiap jawaban
    for answer in answers:
        id_soal = answer.get('id_soal')
        jawaban_text = answer.get('jawaban')
        waktu_jawab = answer.get('waktu_jawab')  # Waktu yang diambil untuk menjawab soal
        
        # Dapatkan soal dari database berdasarkan id_soal
        soal = Soal.query.filter_by(id=id_soal, id_quiz_kode=id_quiz_kode, deleted_at=None).first()
        if not soal:
            continue

        # Dapatkan total waktu dari soal
        total_waktu = soal.waktu.detik  # Anggap `total_waktu` dalam satuan detik

        # Tentukan apakah jawaban benar atau salah
        is_correct = False
        correct_jawaban = None
        for j in soal.soal_jawaban:
            if j.text_jawaban == jawaban_text and j.correct:
                is_correct = True
                correct_jawaban = j  # Simpan jawaban yang benar untuk akses bobot

        score_for_question = 0
        if correct_jawaban and is_correct:
            # Hitung score untuk soal ini berdasarkan waktu jawab dan bobot jawaban yang benar
            score_for_question = ((waktu_jawab / total_waktu) * 100) * correct_jawaban.bobot
            total_score += score_for_question

        # Simpan jawaban peserta
        peserta_jawaban = PesertaJawaban(
            id_quiz_kode=id_quiz_kode,
            id_soal=id_soal,
            id_peserta=id_peserta,
            jawaban=jawaban_text,
            iscorrect=is_correct,
            bobot=correct_jawaban.bobot if is_correct else 0,
            created_at=datetime.utcnow()
        )
        db.session.add(peserta_jawaban)

    # Cek apakah nilai peserta sudah ada sebelumnya
    peserta_nilai = PesertaNilai.query.filter_by(id_quiz_kode=id_quiz_kode, id_peserta=id_peserta, deleted_at=None).first()
    if peserta_nilai:
        # Tambahkan nilai baru ke nilai yang sudah ada
        peserta_nilai.nilai += total_score
        peserta_nilai.updated_at = datetime.utcnow()
    else:
        # Tambah nilai baru jika belum ada
        peserta_nilai = PesertaNilai(
            id_quiz_kode=id_quiz_kode,
            id_peserta=id_peserta,
            nilai=total_score,
            created_at=datetime.utcnow()
        )
        db.session.add(peserta_nilai)

    db.session.commit()

    return jsonify({
        'message': 'Jawaban dan nilai peserta berhasil disimpan', 
        'data':{
            'total_score': total_score,
            'score_for_question': score_for_question
        }
    }), 200



@quiz_bp.route('/answer_count/<int:id_quiz_kode>/<int:id_soal>', methods=['GET'])
def answer_count(id_quiz_kode, id_soal):
    # Dapatkan semua jawaban peserta untuk soal tertentu dalam quiz,
    # dengan peserta yang tidak memiliki deleted_at
    peserta_jawaban = (
        db.session.query(PesertaJawaban)
        .join(Peserta, Peserta.id == PesertaJawaban.id_peserta)
        .filter(
            PesertaJawaban.id_quiz_kode == id_quiz_kode,
            PesertaJawaban.id_soal == id_soal,
            PesertaJawaban.deleted_at == None,
            Peserta.deleted_at == None  # Tambahkan filter peserta.deleted_at IS NULL
        )
        .all()
    )

    # Hitung jumlah pilihan untuk setiap opsi jawaban
    answer_count = {}
    for jawaban in peserta_jawaban:
        if jawaban.jawaban not in answer_count:
            answer_count[jawaban.jawaban] = 0
        answer_count[jawaban.jawaban] += 1


    # Kembalikan hasil dalam format JSON
    return jsonify(answer_count), 200

@quiz_bp.route('/top_scores/<int:id_quiz_code>', methods=['GET'])
def get_top_scores(id_quiz_code):
    # Mengambil 5 data peserta nilai teratas berdasarkan id_quiz_code
    top_scores = (
        db.session.query(PesertaNilai, Peserta)
        .join(Peserta, Peserta.id == PesertaNilai.id_peserta)
        .filter(
            PesertaNilai.id_quiz_kode == id_quiz_code,
            PesertaNilai.deleted_at == None,
            Peserta.deleted_at == None
        )
        .order_by(desc(PesertaNilai.nilai))
        .limit(5)
        .all()
    )
    
    # Format data untuk respons JSON
    top_scores_data = [
        {
            "name": peserta.kode_unik,
            "score": peserta_nilai.nilai
        }
        for peserta_nilai, peserta in top_scores
    ]

    return jsonify(top_scores_data), 200

@quiz_bp.route('/ranking/<int:id_quiz_kode>/<int:id_peserta>', methods=['GET'])
def get_participant_ranking(id_quiz_kode, id_peserta):
   # Buat subquery untuk menghitung peringkat berdasarkan nilai tertinggi
    subquery = (
        db.session.query(
            PesertaNilai.id_peserta,
            PesertaNilai.nilai,
            func.rank().over(order_by=PesertaNilai.nilai.desc()).label("rank")
        )
        .join(Peserta, Peserta.id == PesertaNilai.id_peserta)  # Join dengan Peserta
        .filter(
            PesertaNilai.id_quiz_kode == id_quiz_kode,
            PesertaNilai.deleted_at.is_(None),
            Peserta.deleted_at.is_(None)  # Filter Peserta yang belum dihapus
        )
        .subquery()
    )

    # Gabungkan subquery dengan tabel Peserta untuk mendapatkan kode_unik peserta
    peserta_nilai = (db.session.query(Peserta.kode_unik, subquery.c.nilai, subquery.c.rank)
                     .join(Peserta, Peserta.id == subquery.c.id_peserta)
                     .filter(
                            Peserta.deleted_at.is_(None),  # Pastikan Peserta belum dihapus
                            subquery.c.id_peserta == id_peserta
                        )
                     .first())

    # Jika peserta tidak ditemukan, kembalikan error
    if not peserta_nilai:
        return jsonify({'error': 'Peserta tidak ditemukan'}), 404

    response = {
        "rank": peserta_nilai.rank,
        "name": peserta_nilai.kode_unik,  # Ganti 'name' menjadi 'kode_unik' sebagai nama peserta
        "points": peserta_nilai.nilai
    }

    return jsonify(response), 200

@quiz_bp.route('/top_winners/<int:id_quiz_kode>', methods=['GET'])
def get_top_winners(id_quiz_kode):
    # Ambil tiga peserta dengan nilai tertinggi berdasarkan id_quiz_kode
    top_scores = (db.session.query(Peserta.kode_unik.label("name"), PesertaNilai.nilai.label("score"))
                  .join(PesertaNilai, Peserta.id == PesertaNilai.id_peserta)
                  .filter(PesertaNilai.id_quiz_kode == id_quiz_kode, Peserta.deleted_at.is_(None), PesertaNilai.deleted_at.is_(None))
                  .order_by(PesertaNilai.nilai.desc())
                  .limit(3)
                  .all())

    # Jika tidak ada peserta yang ditemukan
    if not top_scores:
        return jsonify({'error': 'No winners found for this quiz code'}), 404

    # Map posisi ke dalam struktur data yang diinginkan
    winners = []
    for index, (name, score) in enumerate(top_scores):
        position = index + 1
        winner_data = {
            "position": position,
            "name": name,
            "score": score,
            "bgColor": "bg-gray-600" if position == 2 else "bg-yellow-500" if position == 1 else "bg-amber-500",
            "color": "bg-gray-600" if position == 2 else "bg-yellow-400" if position == 1 else "bg-amber-500",
            "height": "h-40" if position == 2 else "h-64" if position == 1 else "h-48",
            "avatar": f"/src/img/mendali_{position}.png"
        }
        winners.append(winner_data)

    return jsonify(winners), 200

# ==========================================Login=======================================
# Endpoint untuk registrasi (untuk membuat akun baru)
@quiz_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']
    
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = Users(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully!"}), 201

# Endpoint untuk login
@quiz_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']
    
    user = Users.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        return jsonify({"message": "Login successful", "username": username}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401
