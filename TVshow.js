let query;
let $template = document.querySelector(".template").content;
let fragment = document.createDocumentFragment();
const setShows = [];
let saveShows = [];
let saveActive = false;
let isElementSave = false;

// event keydown
document.addEventListener("keydown", (e) => {
  // filtro de busqueda de guardados
  if (saveActive && document.querySelector(".container-save-card") !== null) {
    let elementCard = Array.from(
      document.querySelector(".container-save-card").children
    );

    elementCard.forEach((el) => {
      new RegExp(
        document.getElementById("buscar").value.toLowerCase(),
        "img"
      ).test(el.firstElementChild.textContent.toLowerCase())
        ? el.classList.remove("none")
        : el.classList.add("none");
    });
  } else {
    //  busqueda de show
    if (e.key === "Enter") {
      document
        .querySelector(".btn-open-save")
        .classList.remove("btn-open-save-active");

      if (document.getElementById("buscar").value === "")
        return console.log("por favor rellene con algo");

      query = document.getElementById("buscar").value;

      shows(`https://api.tvmaze.com/search/shows?q=${query}`);
      document.getElementById("buscar").value = "";
    }
  }
});

// funcion para añadir las card
function addCard() {
  const $fragmentSave = document.createDocumentFragment();
  const $templateSave = document.getElementById("templateSave").content;

  if (saveShows.length !== 0) {
    saveShows.forEach((el) => {
      $templateSave.querySelector(".title-card").textContent = el.name;
      $templateSave
        .querySelector(".img-save")
        .setAttribute(
          "src",
          el.image && el.image.medium
            ? el.image.medium
            : "/assets/images/perfil.jpg"
        );
      $templateSave
        .querySelector(".img-save")
        .setAttribute("alt", `Imagen de ${el.title ? el.title : "--"}`);
      $templateSave
        .querySelector(".watch-save-card")
        .setAttribute("href", el.url ? el.url : "#");
      $templateSave
        .querySelector(".remove-save-card")
        .setAttribute("data-id", el.id);

      const $saveClone = $templateSave.cloneNode(true);
      $fragmentSave.append($saveClone);
    });

    document.querySelector(".container-save-card").innerHTML = "";
    document.querySelector(".container-save-card").append($fragmentSave);
  } else {
    // caundo en el array de guardado no hay elementos borramos lo que haiga en main y agregamos el texto
    document.querySelector("main").innerHTML =
      '<p class="no-element">No hay elementos Guardado</p>';
  }
}

// event click
document.addEventListener("click", async (e) => {
  // open de save page
  if (e.target.matches(".btn-open-save")) {
    saveActive = !saveActive;

    // open de save page
    if (saveActive) {
      e.target.classList.add("btn-open-save-active");
      try {
        const res = await fetch("./TVsave.html");
        if (res.ok) {
          document.querySelector("main").innerHTML = await res.text();

          // accediendo al conteido de guardado e insertando contenido
          addCard();
        } else {
          document.querySelector(
            "main"
          ).innerHTML = `<p class="error-p">Ha ocurrido un error con la pestaña de guardado</p>`;
        }
      } catch (error) {
        console.log(error);
      }
      // close de save page
    } else {
      document.querySelector("main").innerHTML = "";
      e.target.classList.remove("btn-open-save-active");
    }
  }

  // esta variable se usa para cuando se añade btn-quit se añada al btn sete no se active
  let activate = false;

  // poniendo funcionar el boton de guardado
  if (e.target.matches(".btn-save")) {
    activate = true;
    e.target.classList.add("btn-quit-save");
    e.target.classList.remove("btn-save");
    e.target.textContent = "Quitar";

    const existsIndex = saveShows.some(
      (el) => el.id === parseInt(e.target.dataset.id)
    );

    if (!existsIndex) {
      saveShows.push(
        setShows.find((el) => el.id === parseInt(e.target.dataset.id))
      );
    }
  }

  // para quitar de guardado
  if (e.target.matches(".btn-quit-save")) {
    console.log(activate);
    if (!activate) {
      e.target.textContent = "Guardar";

      saveShows = saveShows.filter(
        (el) => el.id !== parseInt(e.target.dataset.id)
      );
      e.target.classList.add("btn-save");
      e.target.classList.remove("btn-quit-save");
    }
  }

  if (e.target.matches(".remove-save-card")) {
    // remover la targeta de la pestaña de guardado

    let confirmar = confirm("estas seguro de borral este elemento");
    if (confirmar) {
      saveShows = saveShows.filter(
        (el) => el.id !== parseInt(e.target.dataset.id)
      );
      addCard();
    }
  }
});

// insert HTML save

async function shows(url) {
  let res1 = await fetch(url);
  let res = await res1.json();

  //  create cards
  res.forEach((el) => {
    if (el.show.image?.medium) {
      $template.querySelector("img").setAttribute("src", el.show.image.medium);
    } else {
      $template
        .querySelector("img")
        .setAttribute(
          "src",
          "https://static.tvmaze.com/images/no-img/no-img-portrait-text.png"
        );
    }

    setShows.push(el.show);
    $template
      .querySelector("img")
      .setAttribute("alt", `Pelicula de ${el.show.name}`);
    $template.querySelector("h3").innerHTML = el.show.name;
    $template.querySelector(".genders").innerHTML = el.show.genres.join(",");
    $template.querySelector(
      ".date"
    ).innerHTML = `<b>fecha:</b>${el.show.premiered}`;
    $template.querySelector(
      ".langage"
    ).innerHTML = `<b>Lenguage:</b>${el.show.language}`;
    $template.querySelector(".btn-watch").setAttribute("href", el.show.url);
    $template.querySelector("button").setAttribute("data-id", el.show.id);
    if (saveShows.some((element) => element.id === el.show.id)) {
      $template.querySelector("button").textContent = "Quitar";
      $template.querySelector("button").classList.add("btn-quit-save");
      $template.querySelector("button").classList.remove("btn-save");
    } else {
      $template.querySelector("button").textContent = "Guardar";
      $template.querySelector("button").classList.add("btn-save");
    }
    let clone = $template.cloneNode(true);
    if (el.show.summary === null) {
      clone.querySelector(".card-summary").textContent = "No hay resurtados";
    } else {
      clone
        .querySelector(".card-summary")
        .insertAdjacentHTML("beforeend", el.show.summary);
    }
    fragment.append(clone);
  });

  document.querySelector("main").innerHTML = "";
  document.querySelector("main").append(fragment);
}
