"""
CrossBugSense — saved analysis sessions ("chats") per user.
Endpoints: GET/POST /api/chats, GET/PATCH/DELETE /api/chats/<id>
"""
import json
import sqlite3

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from auth import DB_PATH, get_db

chats_bp = Blueprint('chats', __name__, url_prefix='/api/chats')


def init_chat_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        '''CREATE TABLE IF NOT EXISTS chats (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               user_id INTEGER NOT NULL,
               title TEXT NOT NULL,
               model TEXT DEFAULT '',
               payload TEXT NOT NULL,
               pinned INTEGER NOT NULL DEFAULT 0,
               created_at TEXT DEFAULT CURRENT_TIMESTAMP
           )'''
    )
    conn.execute('CREATE INDEX IF NOT EXISTS idx_chats_user ON chats (user_id)')
    conn.commit()
    conn.close()


def _uid():
    return int(get_jwt_identity())


def _parse(row):
    try:
        payload = json.loads(row['payload'])
    except (ValueError, TypeError):
        payload = {}
    return payload


def _summary(row):
    payload = _parse(row)
    files = payload.get('files', [])
    return {
        'id': row['id'],
        'title': row['title'],
        'model': row['model'],
        'pinned': bool(row['pinned']),
        'created_at': row['created_at'],
        'buggy_files': sum(1 for f in files if f.get('prediction') == 1),
        'total_files': len(files),
    }


def _get_owned_chat(chat_id):
    row = get_db().execute(
        'SELECT * FROM chats WHERE id = ? AND user_id = ?', (chat_id, _uid())
    ).fetchone()
    return row


@chats_bp.route('', methods=['GET'])
@jwt_required()
def list_chats():
    rows = get_db().execute(
        'SELECT * FROM chats WHERE user_id = ? ORDER BY pinned DESC, created_at DESC, id DESC',
        (_uid(),),
    ).fetchall()
    return jsonify({'chats': [_summary(r) for r in rows]})


@chats_bp.route('', methods=['POST'])
@jwt_required()
def create_chat():
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    payload = data.get('payload')
    if not title or not isinstance(payload, dict):
        return jsonify({'error': 'Chat must include a title and payload.'}), 400

    db = get_db()
    cur = db.execute(
        'INSERT INTO chats (user_id, title, model, payload) VALUES (?, ?, ?, ?)',
        (_uid(), title[:120], data.get('model') or payload.get('model') or '', json.dumps(payload)),
    )
    db.commit()
    row = db.execute('SELECT * FROM chats WHERE id = ?', (cur.lastrowid,)).fetchone()
    return jsonify({'chat': _summary(row)})


@chats_bp.route('/<int:chat_id>', methods=['GET'])
@jwt_required()
def get_chat(chat_id):
    row = _get_owned_chat(chat_id)
    if row is None:
        return jsonify({'error': 'Chat not found.'}), 404
    chat = _summary(row)
    chat['payload'] = _parse(row)
    return jsonify({'chat': chat})


@chats_bp.route('/<int:chat_id>', methods=['PATCH'])
@jwt_required()
def update_chat(chat_id):
    row = _get_owned_chat(chat_id)
    if row is None:
        return jsonify({'error': 'Chat not found.'}), 404

    data = request.get_json(silent=True) or {}
    if 'pinned' not in data or not isinstance(data['pinned'], bool):
        return jsonify({'error': 'Nothing to update. Send "pinned".'}), 400

    db = get_db()
    db.execute('UPDATE chats SET pinned = ? WHERE id = ? AND user_id = ?',
               (1 if data['pinned'] else 0, chat_id, _uid()))
    db.commit()
    updated = db.execute('SELECT * FROM chats WHERE id = ?', (chat_id,)).fetchone()
    return jsonify({'chat': _summary(updated)})


@chats_bp.route('/<int:chat_id>', methods=['DELETE'])
@jwt_required()
def delete_chat(chat_id):
    row = _get_owned_chat(chat_id)
    if row is None:
        return jsonify({'error': 'Chat not found.'}), 404
    db = get_db()
    db.execute('DELETE FROM chats WHERE id = ? AND user_id = ?', (chat_id, _uid()))
    db.commit()
    return jsonify({'ok': True})
