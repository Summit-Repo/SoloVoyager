import json
from data_access.post_data_access import action_on_post, add_concern, delete_post, get_posts_by_batch, get_unresolved_concerns, increase_vote_count, insert_post_story, update_status

with open('config.json') as config_file:
    config_data = json.load(config_file)
    batch_size = config_data["BATCH_SIZE"]


def get_posts_by_batch_service(offset, place=None, user_id=None, post_id=None, vote_userid=None):
    rows, previous_offset, next_offset = get_posts_by_batch(
        offset, place, user_id, post_id, vote_userid)

    return rows, previous_offset, next_offset


def process_vote_service(post_id, vote_type):
    status = increase_vote_count(post_id, vote_type)
    return status


def concern_service(post_id, concern_text):
    status = add_concern(post_id, concern_text)
    return status


def get_unresolved_concerns_service():
    unresolved_concerns = get_unresolved_concerns()

    return unresolved_concerns


def update_user_status(user_id, is_active, is_admin):
    success = update_status(user_id, is_active, is_admin)

    if success:
        return "User status updated successfully."
    else:
        return "Failed to update user status."


def action_on_post_service(user_id=None, post_id=None, concern_id=None):
    return action_on_post(user_id, post_id, concern_id)


def add_post_story(user_id, title, place, days, budget, details):
    complex_data = {
        'areas': details.get('areas', []),
        'food': details.get('food', []),
        'activities': details.get('activities', []),
        'hotels': details.get('hotels', []),
        'detail_story': details.get('detail_story', '')
    }

    insert_post_story(user_id, title, place, days, budget, complex_data)


def delete_post_service(post_id=None):
    return delete_post(post_id)
