from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity


def role_required_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        is_admin = current_user.get('isAdmin', False)
        if is_admin:
            return fn(*args, **kwargs)
        else:
            return jsonify({'message': 'Permission denied'}), 403
    return wrapper


def role_required_non_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        is_admin = current_user.get('isAdmin', False)
        if not is_admin:
            return fn(*args, **kwargs)
        else:
            return jsonify({'message': 'Permission denied'}), 403
    return wrapper


def role_required_common(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user = get_jwt_identity()
        is_admin = current_user.get('isAdmin', False)
        if is_admin is not None:
            return fn(*args, **kwargs)
        else:
            return jsonify({'message': 'Permission denied'}), 403
    return wrapper
