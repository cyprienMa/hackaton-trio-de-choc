from flask import Flask
from flask import render_template
from flask import request
app = Flask(__name__)

from src.utils.ask_question_to_pdf import gpt3_completion, ask_question_to_pdf
@app.route("/")
def hello_world():
    return render_template("index.html")


    
@app.route('/prompt', methods=['POST']) # quand c'est en convention post, c'est un formulaire que je gère, donc j'utilise form et sinon j'aurais pu faire avec get
def response():
    
    #return {"answer": request.form['prompt']}
    # messages = [{"role": "system", "content":"You are a useful assistant"},{"role": "user", "content": request.form['prompt']}]
    user_message = request.form['prompt']
    return {"answer": ask_question_to_pdf(user_message)}

