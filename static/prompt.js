const promptForm = document.getElementById("prompt-form");
const submitButton = document.getElementById("submit-button");
const questionButton = document.getElementById("question-button");

const qcmButton = document.getElementById("qcm-button");
const messagesContainer = document.getElementById("messages-container");
const uploadForm = document.getElementById("upload-form");

let couleur = 0;

const appendHumanMessage = (message) => {
  const humanMessageElement = document.createElement("div");
  humanMessageElement.classList.add("message", "message-human");
  humanMessageElement.innerHTML = message;
  messagesContainer.appendChild(humanMessageElement);
  document.documentElement.scrollTop = document.documentElement.scrollHeight;
};

const appendAIMessage = async (messagePromise) => {
  // Add a loader to the interface
  const loaderElement = document.createElement("div");
  loaderElement.classList.add("message");
  loaderElement.innerHTML =
    "<div class='loader'><div></div><div></div><div></div>";
  messagesContainer.appendChild(loaderElement);


  // Await the answer from the server
  const messageToAppend = await messagePromise();

  // Replace the loader with the answer
  loaderElement.classList.remove("loader");
  loaderElement.innerHTML = messageToAppend;
  var audio1 = document.getElementById('chevreau');

  if (audio1 && couleur == 2) {
    audio1.play().then(() => {
      console.log("Le son joue correctement.");
    }).catch(error => {
      console.error("Erreur lors de la lecture du son : ", error);
    });
  } else {
    console.error("Élément audio non trouvé.");
  }
  var audio2 = document.getElementById('humain');
  if (audio2 && couleur != 2) {
    audio2.play().then(() => {
      console.log("Le son joue correctement.");
    }).catch(error => {
      console.error("Erreur lors de la lecture du son : ", error);
    });
  } else {
    console.error("Élément audio non trouvé.");
  }

  document.documentElement.scrollTop = document.documentElement.scrollHeight;
};

const handlePrompt = async (event) => {
  event.preventDefault();
  // Parse form data in a structured object
  const data = new FormData(event.target);
  promptForm.reset();

  let url = "/prompt";
  if (questionButton.dataset.question !== undefined) {
    url = "/answer";
    data.append("question", questionButton.dataset.question);
    delete questionButton.dataset.question;
    questionButton.classList.remove("hidden");
    qcmButton.classList.remove("hidden");
    submitButton.innerHTML = "Message";
  }

  else if (qcmButton.dataset.question !== undefined) {
    url = "/answer";
    data.append("question", qcmButton.dataset.question);
    delete qcmButton.dataset.question;
    qcmButton.classList.remove("hidden");
    questionButton.classList.remove("hidden");
    submitButton.innerHTML = "Message";
  }
  const fileName = document.getElementById('file-upload').files[0]?.name || '';
  data.append("filename", fileName);

  appendHumanMessage(data.get("prompt"));

  await appendAIMessage(async () => {
    const response = await fetch(url, {
      method: "POST",
      body: data,
    });
    const result = await response.json();
    return result.answer;
  });
};

promptForm.addEventListener("submit", handlePrompt);


const handleQuestionClick = async (event) => {
  appendAIMessage(async () => {
    const response = await fetch("/question", {
      method: "GET",
    });
    const result = await response.json();
    const question = result.answer;

    questionButton.dataset.question = question;
    questionButton.classList.add("hidden");
    qcmButton.classList.add("hidden");
    submitButton.innerHTML = "Répondre à la question";
    return question;
  });
};

const handleQCMClick = async (event) => {
  appendAIMessage(async () => {
    const response = await fetch("/qcm", {
      method: "GET",
    });
    const result = await response.json();
    const question = result.answer;

    qcmButton.dataset.question = question;
    qcmButton.classList.add("hidden");
    questionButton.classList.add("hidden");
    submitButton.innerHTML = "Répondre à la question";
    return question;
  });
};

const toggleButton = document.getElementById('theme-toggle');

toggleButton.addEventListener('click', () => {
  if (couleur == 0) {
    document.documentElement.style.setProperty('--main-background-color', 'grey');
    document.documentElement.style.setProperty('--main-background-color_', 'grey');
    document.documentElement.style.setProperty('--body-background-color', 'rgba(0,0,0,0.8');
    document.documentElement.style.setProperty('--main-color', 'white');
    document.documentElement.style.setProperty('--secondary-color', 'steelblue');
    couleur = 1;
  }
  else if (couleur == 1) {
    var audio = document.getElementById('chevre');
    if (audio) {
      audio.play().then(() => {
        console.log("Le son joue correctement.");
      }).catch(error => {
        console.error("Erreur lors de la lecture du son : ", error);
      });
    } else {
      console.error("Élément audio non trouvé.");
    }
    document.documentElement.style.setProperty('--main-background-color', 'rgba(255, 255, 255, 0.3)');
    document.documentElement.style.setProperty('--main-background-color_', 'rgba(255,255,255,0.8');
    document.documentElement.style.setProperty('--main-color', 'black');
    document.documentElement.style.setProperty('--secondary-color', 'rgba(143, 188, 143, 0.8)');
    document.documentElement.style.setProperty('--body-background-color', 'gainsboro');
    document.body.classList.toggle('background-active');
    couleur = 2;
  }
  else {
    document.body.classList.toggle('background-active');
    document.documentElement.style.setProperty('--main-background-color', 'white');
    document.documentElement.style.setProperty('--main-background-color_', 'white');
    document.documentElement.style.setProperty('--body-background-color', 'gainsboro');
    document.documentElement.style.setProperty('--main-color', 'black');
    document.documentElement.style.setProperty('--secondary-color', 'paleturquoise');
    couleur = 0;
  }
});


const newChat = document.getElementById('new-chat');

function clearContent() {
  document.getElementById('messages-container').innerHTML = '';
  fetch("/newchat", { method: "GET" });
}

questionButton.addEventListener("click", handleQuestionClick);
qcmButton.addEventListener("click", handleQCMClick);


window.onscroll = function () {
  const button = document.getElementById('backToTop');
  if (document.documentElement.scrollTop > 200) {
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
};

// Fonction pour faire défiler vers le haut
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

const handleUpload = async (event) => {
  event.preventDefault();
  const formData = new FormData(uploadForm);

  await appendAIMessage(async () => {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    return result.message || result.error;
  });

};


uploadForm.addEventListener("submit", handleUpload);

