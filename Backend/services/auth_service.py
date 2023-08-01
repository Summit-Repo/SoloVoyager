from datetime import datetime, timedelta
from mailbox import Mailbox, Message
import jwt
from werkzeug.security import generate_password_hash, check_password_hash
from data_access.auth_data_access import get_user_by_username, create_user, search_users_by_username, update_user_password
from flask import current_app


def register_user(username, password):
    existing_user = get_user_by_username(username)
    if existing_user:
        return False, 'Username already exists'

    hashed_password = generate_password_hash(password)
    create_user(username, hashed_password)

    return True, 'User registered successfully'


def authenticate_user(username, password):
    user = get_user_by_username(username)
    if user and user['isActive'] == 0:
        return {'error': 'User account islocked!'}
    if user and check_password_hash(user['password'], password):
        expiration_time = datetime.utcnow(
        ) + current_app.config['JWT_ACCESS_TOKEN_EXPIRES']
        token_payload = {
            'sub': user['username'],
            'isAdmin': user['isAdmin'],
            'user_id': user['id'],
            'exp': expiration_time.isoformat()
        }
        token = jwt.encode(
            {'sub': token_payload},
            current_app.config['SECRET_KEY'], algorithm='HS256')
        return {'token': token, 'isAdmin': user['isAdmin']}
    else:
        return {'error': 'Invalid username or password!'}


def reset_password(username, old_password, new_password):
    user = get_user_by_username(username)

    if user and check_password_hash(user['password'], old_password):
        hashed_password = generate_password_hash(new_password)
        update_user_password(username, hashed_password)
        return True, 'Password reset successfully'
    else:
        return False, 'Invalid username or old password'


def search_users_by_username_service(username):
    return search_users_by_username(username)
