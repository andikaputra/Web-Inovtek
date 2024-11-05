from . import db  # Import db from the main app package instead of redefining it
from datetime import datetime

class QuizKode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kode = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 
    peserta = db.relationship('Peserta', backref='quiz_kode', lazy=True)
    peserta_nilai = db.relationship('PesertaNilai', backref='quiz_kode', lazy=True)
    soal = db.relationship('Soal', backref='quiz_kode', lazy=True)

class Peserta(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_quiz_kode = db.Column(db.Integer, db.ForeignKey('quiz_kode.id'), nullable=False)
    kode_unik = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 
    nilai = db.relationship('PesertaNilai', backref='peserta', lazy=True)

class PesertaNilai(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_quiz_kode = db.Column(db.Integer, db.ForeignKey('quiz_kode.id'), nullable=False)
    id_peserta = db.Column(db.Integer, db.ForeignKey('peserta.id'), nullable=False)
    jawaban = db.Column(db.Text, nullable=False)
    iscorrect = db.Column(db.Boolean, nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 

class PesertaJawaban(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_soal = db.Column(db.Integer, db.ForeignKey('soal.id'), nullable=False)
    id_peserta = db.Column(db.Integer, db.ForeignKey('peserta.id'), nullable=False)
    nilai = db.Column(db.Integer, nullable=False)
    bobot = db.Column(db.Integer, nullable=False) 
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 

class SoalJenis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 
    soal = db.relationship('Soal', backref='soal_jenis', lazy=True)

class Waktu(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nama = db.Column(db.String(255), nullable=False)
    detik = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 
    soal = db.relationship('Soal', backref='soal', lazy=True)

class Soal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_quiz_kode = db.Column(db.Integer, db.ForeignKey('quiz_kode.id'), nullable=False)
    id_soal_jenis = db.Column(db.Integer, db.ForeignKey('soal_jenis.id'), nullable=False)
    id_waktu = db.Column(db.Integer, db.ForeignKey('waktu.id'), nullable=False)
    pertanyaan = db.Column(db.String(255), nullable=False)
    file = db.Column(db.Text, nullable=False)
    jenis_file = db.Column(db.String(255), nullable=False)
    layout = db.Column(db.Integer, nullable=False) 
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 
    soal_jawaban = db.relationship('SoalJawaban', backref='soal_jawaban', lazy=True)

class SoalJawaban(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_soal = db.Column(db.Integer, db.ForeignKey('soal.id'), nullable=False)
    text_jawaban = db.Column(db.Text, nullable=False)
    correct = db.Column(db.Boolean, nullable=False)
    bobot = db.Column(db.Integer, nullable=False) 
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 
