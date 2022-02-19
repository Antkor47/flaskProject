from web_page import app
from flask import render_template, redirect, url_for, flash, get_flashed_messages, request, jsonify
from web_page.modules import Leaderboard, User, SnakeGameScores
from web_page.forms import RegisterForm, LoginForm
from web_page import db
from flask_login import login_user, logout_user, login_required, current_user
import datetime


@app.route('/')
@app.route('/home')
def home_page():
    return render_template("home.html")


@app.route('/snake')
@login_required
def snake_page():
    leaderboard = Leaderboard.query.all()
    return render_template("snake.html", leaderboard=leaderboard)


@app.route("/register", methods=["GET", "POST"])
def register_page():
    form = RegisterForm()
    if form.validate_on_submit():
        user_to_create = User(username=form.username.data,
                              email_address=form.email_address.data,
                              password=form.password1.data)
        db.session.add(user_to_create)
        db.session.commit()
        login_user(user_to_create)
        flash(f"Account created successfully! You are now logged in as {user_to_create.username}", category="success")
        return redirect(url_for("home_page"))
    if form.errors != {}:  # If there are not errors from the validations
        for err_msg in form.errors.values():
            flash(f"There was an error with creating a user: {err_msg}", category="danger")

    return render_template("register.html", form=form)


@app.route("/login", methods=["GET", "POST"])
def login_page():
    form = LoginForm()
    if form.validate_on_submit():
        attempted_user = User.query.filter_by(username=form.username.data).first()
        if attempted_user and attempted_user.check_password_correction(
                attempted_password=form.password.data):
            login_user(attempted_user)
            flash(f"Success! You are logged in as: {attempted_user.username}", category="success")
            return redirect(url_for("home_page"))
        else:
            flash("Username and password are not match! Please try again", category="danger")

    return render_template("login.html", form=form)


@app.route("/logout")
def logout_page():
    logout_user()
    flash("You have been logged out", category="info")
    return redirect(url_for("home_page"))


@app.route('/_get_post_score', methods=['GET', 'POST'])
def get_post_score():

    if request.method == 'POST':
        data = request.form.get('score')
        name = current_user.username
        score = int(data)
        time = datetime.datetime.now()
        player_score = SnakeGameScores(time=time, name=name, score=score)
        db.session.add(player_score)

        players = Leaderboard.query.all()

        if players:
            leaderboard_min = players[0].score
            for player in players:
                if player.score < leaderboard_min:
                    leaderboard_min = player.score

            if current_user.personal_best_score < score > leaderboard_min:
                add_to_leaderboard(name, score, leaderboard_min)
        else:
            add_to_leaderboard(name, score, 0)

        if current_user.personal_best_score < score:
            current_user.personal_best_score = score

        db.session.commit()
        return jsonify(status="success", data=data)


def add_to_leaderboard(name, score, player_to_drop):
    board = []
    drop = Leaderboard.query.filter_by(score=player_to_drop).all()
    drop = drop[-1]

    if len(Leaderboard.query.all()) > 9:
        db.session.delete(drop)
        db.session.commit()

    db.session.add(Leaderboard(name=name, score=score))
    db.session.commit()

    players = Leaderboard.query.all()
    for player in players:
        board.append([player.score, player.name])
        db.session.delete(player)

    board.sort(reverse=True)
    db.session.commit()

    for index, p in enumerate(board):
        points = p[0]
        nam = p[1]
        db.session.add(Leaderboard(name=nam, score=points))
    db.session.commit()
