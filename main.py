from flask import Flask, render_template, request, send_from_directory
from src.utils.ask_question_to_pdf import ask_question_to_pdf
from src.utils.ask_question_to_pdf import process_pdf_file
import os

app = Flask(__name__)

# Définir le dossier où les fichiers téléversés seront stockés
UPLOAD_FOLDER = "pdf_docs"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

pdf_documents = {}

# Créer le dossier 'uploads' s'il n'existe pas déjà
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
# filename = "filename.pdf"
# filepath = os.path.join(os.path.dirname(__file__), filename)
# if os.path.exists(filepath):
# pdf_documents[filename] = process_pdf_file(filepath)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/prompt", methods=["POST"])
def answer():
    question = request.form["prompt"]
    filename = request.form.get("filename")
    response = ask_question_to_pdf(
        [{"role": "user", "content": question}],
        pdf_documents=pdf_documents,
        filename=filename,
    )
    return {"answer": response}


@app.route("/question", methods=["GET"])
def course_question():
    question = "Pose une question simple sur une information issue de ce texte. Ne pose pas une question que tu as déjà posée précédemment."
    response = ask_question_to_pdf([{"role": "system", "content": question}])
    return {"answer": response}


@app.route("/qcm", methods=["GET"])
def qcm_question():
    question = "Pose une question à choix multiple, avec 4 propositions."
    response = ask_question_to_pdf([{"role": "system", "content": question}])
    return {"answer": response}


@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory("static", filename)


@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "pdf" not in request.files:
        return {"error": "Aucun fichier PDF fourni"}, 400

    file = request.files["pdf"]

    if file.filename == "":
        return {"error": "Aucun fichier sélectionné"}, 400

    # sauvergarde du fichier avec un nom sécurisé
    if file and file.filename.endswith(".pdf"):
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filepath)

        pdf_documents[file.filename] = process_pdf_file(filepath)

        return {"message": "Fichier PDF téléversé et traité avec succès."}, 200
    return {"error": "Le fichier n'est pas un PDF valide."}, 400


@app.route("/answer", methods=["POST"])
def qcm_reponse():
    question = request.form["prompt"]
    response = ask_question_to_pdf(
        [
            {"role": "user", "content": question},
            {
                "role": "system",
                "content": "Vérifie si cette réponse à la question précédente est correcte. Donne des explications. Attention : une réponse vide n'est pas correcte !",
            },
        ]
    )
    return {"answer": response}


from src.utils.ask_question_to_pdf import clean_historic


@app.route("/newchat", methods=["GET"])
def clear_history():
    clean_historic()
    return {}


if __name__ == "__main__":
    app.run(debug=True)
