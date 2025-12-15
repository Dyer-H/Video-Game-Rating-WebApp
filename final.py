#-------------------------- Notes about project ----------------------------------------
#html has no comments because no
# -- I feel like html always looks dirty
# -- This is the same reason the css also doesn't have comments
#note that sometimes the blur filter on css glitches out on the browser
# -- nothing I can really do about that
# -- also some strange resizing behavior on some pages but oh well
#using AJAX to avoid reloading pages with forms (looks less clean)
# -- therefore have internal apis
#understand that functionality of home route could be achieved exactly
# -- without the use of apis, but since I was using them anyway for other routes
# -- I figured I would keep the codebase consistent
#admittedly javascript has a lot of repeat code
# -- could be fixed with javascript inheritance and imports
# -- however we didn't learn this in class and I only learned about it towards
# -- the end of completion
#overall code could use some refactoring but definitely happy with the
# -- client-side result


#--------- imports -- flask -- ORM -- user authenticator -- websockets -----------------
from flask import Flask, render_template, request, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, \
    login_user, logout_user, current_user, login_required
from flask_json import FlaskJSON, json_response


#--------------- boilerplate code -- constructors and configurations -------------------
app = Flask(__name__, static_url_path='/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SECRET_KEY'] = 'ansnaergoir723#3445!842'

db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
json = FlaskJSON(app)


#------------------------------- database creation -------------------------------------
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(36), unique=True, nullable=False)
    password = db.Column(db.String(72), nullable=False)
    ratings = db.relationship('VideoGameRatings', backref='user')

class VideoGameRatings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    rating = db.Column(db.Float)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))


with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    user = db.session.scalar(db.select(User).where(User.id == user_id))
    return user


#----------------------------------- app routes ----------------------------------------
#base route
# -- redirects to /login
@app.route('/')
def index():
    return redirect('/login')

#login route
# -- redirects to /home if user is logged in
# -- otherwise renders log in page
# -- supports both log in and creation of users (see HTML, CSS, JS)
@app.route('/login')
def login():
    if current_user.is_authenticated:
        return redirect('/home')
    return render_template('login.html')

#logout route
# -- logs out user
# -- redirects them to login
@app.route('/logout')
def logout():
    logout_user()
    return redirect('/login')

#home route
# -- protected
# -- includes navbar
# -- functions as the RETRIEVE portion of CRUD
@app.route('/home')
@login_required
def home():
    return render_template('home.html')

#create route
# -- protected
# -- includes navbar
# -- functions as the CREATE portion of CRUD
@app.route('/create')
@login_required
def create():
    return render_template('create.html')

#edit route
# -- protected
# -- includes navbar
# -- functions as the UPDATE and DELETE portion of CRUD
@app.route('/edit')
@login_required
def edit():
    return render_template('edit.html')


#----------------------------------- api routes ----------------------------------------

#---------- log in page api routes ----------

#api to log in a user
# -- checks if username and password match
# -- --- if no match send false to js side
# -- --- if match send true to js side
@app.route('/api/authUser', methods=['POST'])
def authUser():
    user_data = request.get_json(force=True)
    username = user_data['username']
    password = user_data['password']
    user = db.session.scalar(db.select(User).where(User.username == username))
    if user is None or user.password != password:
        return json_response(success=False)
    login_user(user)
    return json_response(success=True)

#api to create a user
# -- checks if username already exists
# -- --- if not create new user, add to database, log them in, send true to js side
# -- --- if so send false to js side
@app.route('/api/createUser', methods=['POST'])
def createUser():
    user_data = request.get_json(force=True)
    username = user_data['username']
    password = user_data['password']
    user = db.session.scalar(db.select(User).where(User.username == username))
    if user is None:
        n_user = User(username=username, password=password)
        db.session.add(n_user)
        db.session.commit()
        login_user(n_user)
        return json_response(success=True)
    return json_response(success=False)


#---------- after log in api routes ----------
#api to get ratings
# -- returns all ratings and users who created ratings
@app.route('/api/getRatings/', methods=['GET'])
def getRatings():
    rating_data = db.session.scalars(db.select(VideoGameRatings).order_by(VideoGameRatings.name))
    names = []
    ratings = []
    users = []
    for r in rating_data:
        names.append(r.name)
        ratings.append(r.rating)
        users.append(r.user.username)
    return json_response(names=names, ratings=ratings, users=users)

#api to get user's ratings
# -- protected because user must first be established
# -- returns all ratings by user
@app.route('/api/getPersonalRatings', methods=['GET'])
@login_required
def getPersonalRating():
    rating_data = db.session.scalars(db.select(VideoGameRatings).where(VideoGameRatings.user == current_user).order_by(VideoGameRatings.name))
    ids = []
    names = []
    ratings = []
    for r in rating_data:
        ids.append(r.id)
        names.append(r.name)
        ratings.append(r.rating)
    return json_response(ids=ids, names=names, ratings=ratings)

#api to create ratings
# -- data verified on js side
# -- creates the rating and links it to current user
@app.route('/api/createRating', methods=['POST'])
def createRating():
    rating_data = request.get_json(force=True)
    name = rating_data['name']
    rating = rating_data['rating']
    n_rating = VideoGameRatings(name=name, rating=rating)
    n_rating.user = current_user
    db.session.add(n_rating)
    db.session.commit()
    return json_response(success=True)

#api to update ratings
# -- data verified on js side
# -- updates rating
@app.route('/api/updateRating', methods=['POST'])
def updateRating():
    rating_data = request.get_json(force=True)
    id = rating_data['id']
    name = rating_data['name']
    rating = rating_data['rating']
    change_data = db.session.scalar(db.select(VideoGameRatings).where(VideoGameRatings.id == id))
    change_data.name = name
    change_data.rating = rating
    db.session.commit()
    return json_response(name=name, rating=rating)

#api to delete ratings
# -- deletes rating
@app.route('/api/deleteRating', methods=['POST'])
def deleteRating():
    data = request.get_json(force=True)
    id = data['id']
    rating = db.session.scalar(db.select(VideoGameRatings).where(VideoGameRatings.id == id))
    db.session.delete(rating)
    db.session.commit()
    return json_response(success=True)


#------------------------------- error handlers ----------------------------------------
#401 error redirects to login
@app.errorhandler(401)
def handle_401(error):
    return redirect('/login')

#404 error displays 404 page
@app.errorhandler(404)
def handle_404(error):
    return render_template('404.html')

#405 error redirects to login
@app.errorhandler(405)
def handle_405(error):
    return redirect('/login')


#------------------------------------ run app ------------------------------------------
app.run()