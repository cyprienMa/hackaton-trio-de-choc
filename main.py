from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('index.html')

#@app.route('/prompt', methods=['POST'])
#def answer():
#    reponse=request.form["prompt"]
#    return {"answer":reponse}

from src.utils.ask_question_to_pdf import ask_question_to_pdf

@app.route('/prompt', methods=['POST'])
def answer():
    question=request.form["prompt"]
    response = ask_question_to_pdf([{"role":"user","content":question}])
    return {"answer":response}

@app.route('/question', methods=['GET'])
def course_question():
    question="Pose une question simple sur une information issue de ce texte. Ne pose pas une question que tu as déjà posée précédemment."
    response = ask_question_to_pdf([{"role":"system","content":question}])
    return {"answer":response}

@app.route('/qcm', methods=['GET'])
def qcm_question():
    question="Pose une question à choix multiple, avec 4 propositions."
    response = ask_question_to_pdf([{"role":"system","content":question}])
    return {"answer":response}

@app.route('/answer', methods=['POST'])
def qcm_reponse():
    question=request.form["prompt"]
    response = ask_question_to_pdf([{"role":"user","content":question},{"role":"system","content":"Vérifie si cette réponse à la question précédente est correcte. Donne des explications."}])
    return {"answer":response}

if __name__ == '__main__':
    app.run(debug=True)
