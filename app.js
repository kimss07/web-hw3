const liked = JSON.parse(localStorage.getItem("liked") || "[]");
function saveLiked() {
  localStorage.setItem("liked", JSON.stringify(liked));
}

const dialog = document.getElementById("detail");

// posterUrl : 포스터 경로, 크기 ⇒ TMDB 이미지 주소 문자열
function posterUrl(path, size) {
  if (!path) {
    return "";
  }
  if (path.startsWith("http")) {
    return path;
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// search : 영화 배열, 검색어 ⇒ 제목에 검색어가 포함된 새 배열
function search(list, keyword) {
  const query = keyword.trim().toLowerCase();
  return list.filter((movie) => movie.title.toLowerCase().includes(query));
}

// sortBy : 영화 배열, 정렬 키, 내림차순 여부 ⇒ 정렬된 새 배열
function sortBy(list, key, desc) {
  const sign = desc ? -1 : 1;
  return [...list].sort((a, b) => {
    if (typeof a[key] === "string") {
      return a[key].localeCompare(b[key], "ko") * sign;
    }
    return (a[key] - b[key]) * sign;
  });
}

// renderCards : 영화 배열 ⇒ #board 카드 렌더링 및 찜 개수·빈 상태 갱신
function renderCards(list) {
  const board = document.getElementById("board");
  const countEl = document.getElementById("count");
  const likeCountEl = document.getElementById("likeCount");
  if (!board) {
    return;
  }

  board.innerHTML = "";

  for (const m of list) {
    const card = document.createElement("article");
    card.className = "card";
    if (m.rating >= 8) {
      card.classList.add("hot");
    }
    if (!m.poster) {
      card.classList.add("no-poster");
    }
    card.setAttribute("data-type", m.type);
    card.setAttribute("data-title", m.title);

    const mediaHtml = m.poster
      ? `<img class="poster" src="${posterUrl(m.poster, "w342")}" alt="${m.title} 포스터">`
      : `<div class="poster-fallback">${m.title[0]}</div>`;

    const rankHtml =
      m.type === "boxoffice" && m.rank != null
        ? `<span class="rank">${m.rank}</span>`
        : "";

    const likeClass = liked.includes(m.title) ? "like liked" : "like";

    card.innerHTML = `
      ${mediaHtml}
      ${rankHtml}
      <span class="badge">${m.rating}</span>
      <div class="info">
        <h3>${m.title}</h3>
        <p class="year">${m.year}</p>
        <button class="${likeClass}" type="button">♥</button>
      </div>
    `;

    board.appendChild(card);
  }

  if (countEl) {
    countEl.textContent = `${list.length}편`;
  }
  if (likeCountEl) {
    likeCountEl.textContent = liked.length;
  }
  if (list.length === 0) {
    board.classList.add("is-empty");
  } else {
    board.classList.remove("is-empty");
  }
}

// getView : 없음 ⇒ 검색·보기 필터·정렬을 순서대로 적용한 새 배열
function getView() {
  const qEl = document.getElementById("q");
  const sortEl = document.getElementById("sort");
  const checkedRadio = document.querySelector('input[name="type"]:checked');

  const keyword = qEl ? qEl.value : "";
  const selectedType = checkedRadio ? checkedRadio.value : "all";
  const sortKey = sortEl ? sortEl.value : "rating";

  let result = search(movies, keyword);
  if (selectedType !== "all") {
    result = result.filter((m) => m.type === selectedType);
  }
  return sortBy(result, sortKey, sortKey !== "title");
}

// refresh : 없음 ⇒ getView() 결과를 renderCards()로 화면에 반영
function refresh() {
  renderCards(getView());
}

// openDetail : 영화 제목 ⇒ 일치하는 영화 정보로 <dialog> 모달 열기
function openDetail(title) {
  const movie = movies.find((m) => m.title === title);
  const detailBody = document.getElementById("detailBody");
  if (!movie || !dialog || !detailBody) {
    return;
  }

  const posterHtml = movie.poster
    ? `<img src="${posterUrl(movie.poster, "w500")}" alt="${movie.title} 포스터">`
    : `<div class="poster-fallback">${movie.title[0]}</div>`;

  detailBody.innerHTML = `
    ${posterHtml}
    <h2>${movie.title}</h2>
    <p>개봉일: ${movie.date}</p>
    <p>평점: ${movie.rating}</p>
    <p>${movie.overview || "줄거리 정보가 없습니다."}</p>
  `;
  dialog.showModal();
}

refresh();

const qInput = document.getElementById("q");
const sortSelect = document.getElementById("sort");
const typeFilter = document.getElementById("typeFilter");
const closeDetailBtn = document.getElementById("closeDetail");

if (qInput) {
  qInput.addEventListener("input", refresh);
  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.target.value = "";
      refresh();
    }
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", refresh);
}

if (typeFilter) {
  typeFilter.addEventListener("change", refresh);
}

document.getElementById("board").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) {
    return;
  }
  const title = card.getAttribute("data-title");

  if (e.target.closest(".like")) {
    const i = liked.indexOf(title);
    if (i === -1) {
      liked.push(title);
    } else {
      liked.splice(i, 1);
    }
    saveLiked();
    refresh();
    return;
  }

  openDetail(title);
});

if (closeDetailBtn && dialog) {
  closeDetailBtn.addEventListener("click", () => {
    dialog.close();
  });
}