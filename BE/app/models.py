from . import db  # Import db from the main app package instead of redefining it
from datetime import datetime

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True)  

class QuizKode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    kode = db.Column(db.String(255), nullable=False)
    mulai = db.Column(db.Boolean, nullable=False, default=False)  # Set default value to False
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

class PesertaJawaban(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_quiz_kode = db.Column(db.Integer, db.ForeignKey('quiz_kode.id'), nullable=False)
    id_soal = db.Column(db.Integer, db.ForeignKey('soal.id'), nullable=False)
    id_peserta = db.Column(db.Integer, db.ForeignKey('peserta.id'), nullable=False)
    jawaban = db.Column(db.Text, nullable=False)
    iscorrect = db.Column(db.Boolean, nullable=False)
    bobot = db.Column(db.Integer, nullable=False) 
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 

class PesertaNilai(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_quiz_kode = db.Column(db.Integer, db.ForeignKey('quiz_kode.id'), nullable=False)
    id_peserta = db.Column(db.Integer, db.ForeignKey('peserta.id'), nullable=False)
    nilai = db.Column(db.Integer, nullable=False)
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
    soal = db.relationship('Soal', backref='waktu', lazy=True)

class Soal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_quiz_kode = db.Column(db.Integer, db.ForeignKey('quiz_kode.id'), nullable=False)
    id_soal_jenis = db.Column(db.Integer, db.ForeignKey('soal_jenis.id'), nullable=False)
    id_waktu = db.Column(db.Integer, db.ForeignKey('waktu.id'), nullable=False)
    pertanyaan = db.Column(db.String(255), nullable=False)
    file = db.Column(db.Text, nullable=True)
    jenis_file = db.Column(db.String(255), nullable=True)
    layout = db.Column(db.Integer, nullable=False) 
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 
    soal_jawaban = db.relationship('SoalJawaban', backref='soal', lazy=True)

class SoalJawaban(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    id_soal = db.Column(db.Integer, db.ForeignKey('soal.id'), nullable=False)
    text_jawaban = db.Column(db.Text, nullable=False)
    correct = db.Column(db.Boolean, nullable=False)
    bobot = db.Column(db.Integer, nullable=False) 
    created_at = db.Column(db.TIMESTAMP, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.TIMESTAMP, nullable=True) 

class SesiMainVR(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    no_sesi = db.Column(db.String(50), nullable=True)
    nama = db.Column(db.String(100), nullable=True)
    skenario = db.Column(db.Text, nullable=True)
    kota = db.Column(db.String(100), nullable=True) 
    lokasi = db.Column(db.String(100), nullable=True) 
    waktu_mulai = db.Column(db.DateTime, nullable=True)
    waktu_selesai = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "no_sesi": self.no_sesi,
            "nama": self.nama,
            "skenario": self.skenario,
            "kota": self.kota,
            "lokasi": self.lokasi,
            "waktu_mulai": self.waktu_mulai.isoformat() if self.waktu_mulai else None,
            "waktu_selesai": self.waktu_selesai.isoformat() if self.waktu_selesai else None, 
        }

class SesiMainAR(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    no_sesi = db.Column(db.String(50), nullable=True)
    nama = db.Column(db.String(100), nullable=True) 
    kota = db.Column(db.String(100), nullable=True) 
    lokasi = db.Column(db.String(100), nullable=True) 
    waktu_mulai = db.Column(db.DateTime, nullable=True)
    waktu_selesai = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=True, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "no_sesi": self.no_sesi,
            "nama": self.nama, 
            "kota": self.kota,
            "lokasi": self.lokasi,
            "waktu_mulai": self.waktu_mulai.isoformat() if self.waktu_mulai else None,
            "waktu_selesai": self.waktu_selesai.isoformat() if self.waktu_selesai else None
        }


class LogSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jumlah = db.Column(db.Integer, nullable=False)
    produk = db.Column(db.String(255), nullable=False)
    sumber = db.Column(db.String(255), nullable=True)
    sumber_link = db.Column(db.String(255), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'jumlah': self.jumlah,
            'produk': self.produk,
            'sumber': self.sumber,
            'sumber_link': self.sumber_link
        }