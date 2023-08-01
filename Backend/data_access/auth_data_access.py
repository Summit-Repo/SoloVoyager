import json
import pyodbc

with open('config.json') as config_file:
    config_data = json.load(config_file)
    connection_string = config_data["DATABASE_CONNECTION"]


def get_user_by_username(username):
    with pyodbc.connect(connection_string) as conn:
        cursor = conn.cursor()
        query = "SELECT * FROM users WHERE username = ?"
        cursor.execute(query, username)
        row = cursor.fetchone()
        if row:
            user = {'id': row[0], 'username': row[1],
                    'password': row[2], 'isAdmin': row[4], 'isActive': row[3]}
            return user
        else:
            return None


def create_user(username, password):
    with pyodbc.connect(connection_string) as conn:
        cursor = conn.cursor()
        query = "INSERT INTO users (username, password) VALUES (?, ?)"
        cursor.execute(query, username, password)
        conn.commit()


def update_user_password(username, new_password):
    with pyodbc.connect(connection_string) as conn:
        cursor = conn.cursor()
        query = "UPDATE users SET password=? WHERE username=?"
        values = (new_password, username)
        cursor.execute(query, values)
        conn.commit()


def search_users_by_username(username):

    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        query = "SELECT id,username,isActive,isAdmin FROM users WHERE username COLLATE SQL_Latin1_General_CP1_CI_AI LIKE ?"
        search_username = f'%{username}%'
        cursor.execute(query, search_username)

        results = cursor.fetchall()

        cursor.close()
        conn.close()

        return results
    except Exception as e:
        print("Error:", str(e))
        return None
