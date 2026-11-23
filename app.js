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

// renderCards : 영화 배열 ⇒ #board 카드 렌더링
function renderCards(list) {
  const board = document.getElementById("board");
  const countEl = document.getElementById("count");
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

    card.innerHTML = `
      ${mediaHtml}
      ${rankHtml}
      <span class="badge">${m.rating}</span>
      <div class="info">
        <h3>${m.title}</h3>
        <p class="year">${m.year}</p>
        <button class="like" type="button">♥</button>
      </div>
    `;

    board.appendChild(card);
  }

  if (countEl) {
    countEl.textContent = `${list.length}편`;
  }
}

renderCards(movies);