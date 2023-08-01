import json
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from routes.decorators import role_required_admin, role_required_common, role_required_non_admin
from services.post_service import action_on_post_service, concern_service, delete_post_service, get_posts_by_batch_service, get_unresolved_concerns_service, process_vote_service, update_user_status, add_post_story

post_blueprint = Blueprint('post', __name__)


@post_blueprint.route("/fetch", methods=["GET"])
@jwt_required()
@role_required_common
def get_posts():
    offset = int(request.args.get("offset", 1))
    place = request.args.get("place")
    isUserPost = request.args.get("isUserPost")
    user_id = ""
    if (isUserPost == 'true'):
        current_user = get_jwt_identity()
        user_id = current_user['user_id']
    else:
        user_id = None

    post_id = request.args.get("post_id")
    current_vote_user = get_jwt_identity()
    rows, previous_offset, next_offset = get_posts_by_batch_service(
        offset, place, user_id, post_id, current_vote_user['user_id'])

    posts = []
    for row in rows:
        post = {
            "post_id": row[0],
            "user_id": row[1],
            "place": row[2],
            "title": row[3],
            "days": row[4],
            "budget": row[5],
            "complex_data": row[6],
            "upvote": row[7],
            "username": row[10],
            "user_vote": row[11]
        }
        posts.append(post)

    response = {
        "username": current_vote_user["sub"],
        "posts": posts,
        "previous_offset": previous_offset,
        "next_offset": next_offset
    }

    return jsonify(response)


@post_blueprint.route("/vote", methods=["POST"])
@jwt_required()
@role_required_non_admin
def increase_vote():
    post_id = request.json.get("post_id")
    current_user = get_jwt_identity()
    return jsonify(process_vote_service(current_user['user_id'], post_id))


@post_blueprint.route("/concern", methods=["POST"])
@jwt_required()
@role_required_non_admin
def concern():
    post_id = request.json.get("post_id")
    concern_text = request.json.get("concern_text")
    return jsonify(concern_service(post_id, concern_text))


@post_blueprint.route('/concerns', methods=['GET'])
@jwt_required()
@role_required_admin
def get_unresolved_concerns():
    unresolved_concerns = get_unresolved_concerns_service()
    concerns = []
    for row in unresolved_concerns:
        post = {
            "concern_id": row[0],
            "post_id": row[1],
            "concern_text": row[2],
            "isActionTaken": row[3]
        }
        concerns.append(post)
    return jsonify({'concerns': concerns})


@post_blueprint.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
@role_required_admin
def update_user(user_id):
    data = request.get_json()
    is_active = data.get('is_active')
    is_admin = data.get('is_admin')
    result = update_user_status(user_id, is_active, is_admin)

    return jsonify({'message': result})


@post_blueprint.route('/post-action', methods=['POST'])
@jwt_required()
@role_required_admin
def action_on_post_route():
    user_id = request.json.get('user_id')
    post_id = request.json.get('post_id')
    concern_id = request.json.get('concern_id')
    result = action_on_post_service(
        user_id=user_id, post_id=post_id, concern_id=concern_id)

    if result:
        return jsonify({'success': True, 'message': 'Action on post successful.'}), 200
    else:
        return jsonify({'success': False, 'message': 'Action on post failed.'}), 500


@post_blueprint.route('/post_story', methods=['POST'])
@jwt_required()
@role_required_non_admin
def post_story():
    try:
        current_user = get_jwt_identity()

        data = request.get_json()
        title = data.get('title')
        place = data.get('place')
        days = data.get('days')
        budget = data.get('budget')
        details = data.get('details', {})

        add_post_story(
            user_id=current_user['user_id'], title=title, place=place, days=days, budget=budget, details=details)
        return jsonify({'message': 'Data inserted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@post_blueprint.route('/delete_post', methods=['POST'])
@jwt_required()
@role_required_non_admin
def delete_post():
    try:

        data = request.get_json()
        post_id = data.get('post_id')

        delete_post_service(post_id=post_id)
        return jsonify({'message': 'Post deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
