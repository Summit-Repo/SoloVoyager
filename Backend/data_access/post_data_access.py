import json
import pyodbc

with open('config.json') as config_file:
    config_data = json.load(config_file)
    connection_string = config_data["DATABASE_CONNECTION"]
    batch_size = config_data["BATCH_SIZE"]


def get_posts_by_batch(offset, place=None, user_id=None, post_id=None, vote_userid=None):
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()

    cursor.execute("EXEC GetPostsByBatch ?, ?, ?, ?, ?, ?",
                   offset, batch_size, place, user_id, post_id, vote_userid)

    rows = cursor.fetchall()
    previous_offset = offset - batch_size
    if (len(rows) < batch_size):
        next_offset = 0
    else:
        next_offset = offset + batch_size

    conn.close()

    return rows, previous_offset, next_offset


def add_concern(post_id, concern_text):
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()

    try:
        cursor.execute("INSERT INTO Concerns (post_id, concern_text) VALUES (?, ?)",
                       (post_id, concern_text))
        conn.commit()
        return True
    except Exception as e:
        print("Error:", str(e))
        return False
    finally:
        cursor.close()
        conn.close()


def get_unresolved_concerns():

    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()

    try:
        select_query = "SELECT * FROM Concerns WHERE isActionTaken = 'False'"
        cursor.execute(select_query)
        concerns = cursor.fetchall()
        return concerns
    except Exception as e:
        print("Error:", str(e))
        return []
    finally:
        cursor.close()
        conn.close()


def increase_vote_count(post_id, vote_type):
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()

    try:
        cursor.execute("EXEC UpdateUpvote @p_user_id=?, @p_post_id=?",
                       (post_id, vote_type))
        conn.commit()
        return True
    except Exception as e:
        print("Error:", str(e))
        return False
    finally:
        cursor.close()
        conn.close()


def update_status(user_id, is_active, is_admin):

    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()

    try:
        update_query = "UPDATE Users SET isActive = ?, isAdmin = ? WHERE id = ?"
        cursor.execute(update_query, is_active, is_admin, user_id)
        conn.commit()
        return True
    except Exception as e:
        print("Error:", str(e))
        return False
    finally:
        cursor.close()
        conn.close()


def action_on_post(user_id=None, post_id=None, concern_id=None):
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        cursor.execute("EXEC ActionOnPost @userId=?, @postId=?, @concern_id=?",
                       user_id, post_id, concern_id)
        conn.commit()

        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print("Error:", str(e))
        return False


def insert_post_story(user_id, title, place, days, budget, complex_data):
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO post_story (user_id, title, place, days, budget, complex_data) VALUES (?, ?, ?, ?, ?, ?)',
                   (user_id, title, place, days, budget, json.dumps(complex_data)))
    conn.commit()


def delete_post(post_id):

    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()

    try:
        update_query = "UPDATE post_story SET isVisible = 0  WHERE post_id = ?"
        cursor.execute(update_query, post_id)
        conn.commit()
        return True
    except Exception as e:
        print("Error:", str(e))
        return False
    finally:
        cursor.close()
        conn.close()
