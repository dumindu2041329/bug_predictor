"""
CrossBugSense — authentication (SQLite users + JWT sessions).
Endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
"""
import os
import re
import sqlite3
from datetime import timedelta

from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'users.db')

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db


@auth_bp.teardown_app_request
def close_db(_exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        '''CREATE TABLE IF NOT EXISTS users (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               email TEXT UNIQUE NOT NULL,
               name TEXT NOT NULL,
               password_hash TEXT NOT NULL,
               created_at TEXT DEFAULT CURRENT_TIMESTAMP
           )'''
    )
    conn.commit()
    conn.close()


def configure_jwt(app):
    app.config['JWT_SECRET_KEY'] = os.environ.get('CBS_JWT_SECRET', 'crossbugsense-dev-secret-change-me')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']


def _user_row(row):
    return {'id': row['id'], 'name': row['name'], 'email': row['email']}


def _issue_token(user):
    token = create_access_token(identity=str(user['id']))
    return jsonify({'token': token, 'user': user})


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not name:
        return jsonify({'error': 'Please enter your name.'}), 400
    if not EMAIL_RE.match(email):
        return jsonify({'error': 'Please enter a valid email address.'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters.'}), 400

    db = get_db()
    try:
        cur = db.execute(
            'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
            (email, name, generate_password_hash(password)),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'An account with this email already exists.'}), 409

    user = {'id': cur.lastrowid, 'name': name, 'email': email}
    return _issue_token(user)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    row = get_db().execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    # Same message for unknown email and wrong password — no account enumeration.
    if row is None or not check_password_hash(row['password_hash'], password):
        return jsonify({'error': 'Incorrect email or password.'}), 401

    return _issue_token(_user_row(row))


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    row = get_db().execute('SELECT * FROM users WHERE id = ?', (get_jwt_identity(),)).fetchone()
    if row is None:
        return jsonify({'error': 'Account no longer exists.'}), 401
    return jsonify({'user': _user_row(row)})
