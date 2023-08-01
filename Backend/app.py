from datetime import timedelta
import json
from flask_mail import Mail
from flask import Flask
from flask_jwt_extended import JWTManager
from routes import auth_routes, post_routes
from flask_cors import CORS


app = Flask(__name__)

with open('config.json') as config_file:
    config_data = json.load(config_file)
SECRET_KEY = config_data['SECRET_KEY']
TOKEN_EXPIRATION = timedelta(hours=config_data['TOKEN_EXPIRATION_HOURS'])

app.register_blueprint(auth_routes.auth_blueprint, url_prefix='/auth')
app.register_blueprint(post_routes.post_blueprint, url_prefix='/post')

app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_HEADER_NAME'] = 'Authorization'
app.config['JWT_HEADER_TYPE'] = 'Bearer'
app.config['SECRET_KEY'] = SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = TOKEN_EXPIRATION
jwt = JWTManager(app)
CORS(app)
CORS(app, origins=['https://example.com', 'http://localhost:4200'])


if __name__ == '__main__':
    app.run(debug=True)
