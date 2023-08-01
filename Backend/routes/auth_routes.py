from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from routes.decorators import role_required_admin, role_required_non_admin
from services.auth_service import register_user, authenticate_user, reset_password, search_users_by_username_service

auth_blueprint = Blueprint('auth', __name__)


@auth_blueprint.route('/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    if not username or not password:
        return jsonify({'error': 'Invalid credentials'}), 400

    success, message = register_user(username, password)
    if success:
        return jsonify({'message': message}), 201
    else:
        return jsonify({'error': message}), 409


@auth_blueprint.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    if not username or not password:
        return jsonify({'error': 'Invalid credentials'}), 400

    user = authenticate_user(username, password)
    if 'token' in user:
        return jsonify(user), 200
    else:
        return jsonify({'error': user['error']}), 401


@auth_blueprint.route('/mainuser', methods=['GET'])
@jwt_required()
@role_required_non_admin
def main_route_nonadmin():
    current_user = get_jwt_identity()
    username = current_user['sub']
    isadmin = current_user['isAdmin']
    return jsonify({'greet': f'Welcome, {username}! {isadmin}'})


@auth_blueprint.route('/mainadmin', methods=['GET'])
@jwt_required()
@role_required_admin
def main_route_admin():
    current_user = get_jwt_identity()
    username = current_user['sub']
    isadmin = current_user['isAdmin']
    return jsonify({'greet': f'Welcome, {username}! {isadmin}'})


@auth_blueprint.route('/reset_password', methods=['POST'])
def reset_password_route():
    username = request.json.get('username')
    old_password = request.json.get('old_password')
    new_password = request.json.get('new_password')

    success, message = reset_password(username, old_password, new_password)

    if success:
        return jsonify({'message': message})
    else:
        return jsonify({'error': message}), 400


@auth_blueprint.route('/searchuser', methods=['GET'])
@jwt_required()
@role_required_admin
def search_users_by_username_route():
    username = request.args.get('username')

    users = search_users_by_username_service(username)

    if users is not None:
        users_result = []
    for row in users:
        user = {
            "id": row[0],
            "username": row[1],
            "isActive": row[2],
            "isAdmin": row[3]
        }
        users_result.append(user)
        return jsonify({'success': True, 'data': users_result}), 200
    else:
        return jsonify({'success': True, 'data': []}), 200
