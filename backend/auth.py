"""
CrossBugSense — authentication (SQLite users + JWT sessions).
Endpoints: POST /api/auth/register, POST /api/auth/login, GET /api/auth/me,
           PATCH /api/auth/profile, POST /api/auth/password, DELETE /api/auth/account
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
    return {
        'id': row['id'],
        'name': row['name'],
        'email': row['email'],
        'created_at': row['created_at'],
    }


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

    row = db.execute('SELECT * FROM users WHERE id = ?', (cur.lastrowid,)).fetchone()
    return _issue_token(_user_row(row))


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


@auth_bp.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    data = request.get_json(silent=True) or {}
    user_id = get_jwt_identity()
    db = get_db()
    row = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Account no longer exists.'}), 401

    name = row['name']
    email = row['email']
    if 'name' in data:
        name = (data.get('name') or '').strip()
        if not name:
            return jsonify({'error': 'Please enter your name.'}), 400
    if 'email' in data:
        email = (data.get('email') or '').strip().lower()
        if not EMAIL_RE.match(email):
            return jsonify({'error': 'Please enter a valid email address.'}), 400

    try:
        db.execute('UPDATE users SET name = ?, email = ? WHERE id = ?', (name, email, user_id))
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'An account with this email already exists.'}), 409

    updated = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    return jsonify({'user': _user_row(updated)})


@auth_bp.route('/password', methods=['POST'])
@jwt_required()
def change_password():
    data = request.get_json(silent=True) or {}
    current = data.get('current_password') or ''
    new = data.get('new_password') or ''
    user_id = get_jwt_identity()
    db = get_db()
    row = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Account no longer exists.'}), 401
    if not check_password_hash(row['password_hash'], current):
        return jsonify({'error': 'Your current password is incorrect.'}), 403
    if len(new) < 8:
        return jsonify({'error': 'New password must be at least 8 characters.'}), 400

    db.execute(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        (generate_password_hash(new), user_id),
    )
    db.commit()
    return jsonify({'ok': True})


@auth_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    data = request.get_json(silent=True) or {}
    password = data.get('password') or ''
    user_id = get_jwt_identity()
    db = get_db()
    row = db.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    if row is None:
        return jsonify({'error': 'Account no longer exists.'}), 401
    if not check_password_hash(row['password_hash'], password):
        return jsonify({'error': 'Password is incorrect.'}), 403

    # Remove the user's saved analyses first, then the account itself.
    db.execute('DELETE FROM chats WHERE user_id = ?', (user_id,))
    db.execute('DELETE FROM users WHERE id = ?', (user_id,))
    db.commit()
    return jsonify({'ok': True})

