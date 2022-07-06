const { Player } = TextAliveApp;

// 単語が発声されていたら #text に表示する
const animateWord = function (now, unit) {
  if (unit.contains(now)) {
    document.querySelector("#text").textContent = unit.text;
  }
};

// TextAlive Player を作る
const player = new Player({
  app: {
    token: "2huPtS6L4YdsaZsm", parameters: [
      {title: "Gradation start color", name: "gradationStartColor", className: "Color", initialValue: "#63d0e2" },
      {title: "Gradation end color", name: "gradationEndColor", className: "Color", initialValue: "#ff9438" },
  ]},
  
  mediaElement: document.querySelector("#media"),
});

const startVideo = document.querySelector(".open");
const bar = document.querySelector("#bar");
const textContainer = document.querySelector("#text");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
let b, c;

startVideo.addEventListener('click', () => {
  // 再生が始まったら #overlay を非表示に
  setTimeout(function(){
    document.querySelector(".top").style.display = "none";
    document.querySelector(".main").style.display = "block";
  },600);
});
  
let cursor = document.getElementById('cursor');
document.addEventListener('mousemove',function(e) {
  let x = e.clientX;
  let y = e.clientY;
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";
});

let cursor2 = document.getElementById('cursorB');
document.addEventListener('mousemove',function(e) {
  let x = e.clientX;
  let y = e.clientY;
  cursor2.style.left = x + "px";
  cursor2.style.top = y + "px";
});

// TextAlive Player のイベントリスナを登録する
player.addListener({
  onAppReady(app) {
  // TextAlive ホストと接続されていなければ再生コントロールを表示する
    if (!app.managed) {
      document.querySelector("#control").style.display = "block";
    }
    if (!app.songUrl) {
      document.querySelector("#media").className = "disabled";
      
      player.createFromSongUrl("https://piapro.jp/t/RoPB/20220122172830", {
        video: {
          // 音楽地図訂正履歴: https://songle.jp/songs/2243651/history
          beatId: 4086301,
          chordId: 2221797,
          repetitiveSegmentId: 2247682,
          // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FRoPB%2F20220122172830
          lyricId: 53718,
          lyricDiffId: 7076
        },
      });
    }
  },
  
  /* パラメタが更新されたら呼ばれる */
  onAppParameterUpdate: () => {
    const params = player.app.options.parameters;
    const sc = player.app.parameters.gradationStartColor, scString = sc ? `rgb(${sc.r}, ${sc.g}, ${sc.b})` : params[0].initialValue;
    const ec = player.app.parameters.gradationEndColor, ecString = ec ? `rgb(${ec.r}, ${ec.g}, ${ec.b})` : params[1].initialValue;
    document.body.style.backgroundColor = ecString;
    document.body.style.backgroundImage = `linear-gradient(0deg, ${ecString} 0%, ${scString} 100%)`;
  },

  onVideoReady(video) {
  // 楽曲情報を表示する
    document.querySelector("#artist").textContent = player.data.song.artist.name;
    document.querySelector("#song").textContent = player.data.song.name;

    // 最後に表示した文字の情報をリセット
    c = null;
  },

  onTimerReady() {
  // ボタンを有効化する
    if (!player.app.managed) {
      document.querySelector("#control > button").className = "";
      document.querySelector("#control > input").className = "";
    }
  },
  
  // 再生位置を更新
  onTimeUpdate(position) {
    // シークバーの表示を更新
    paintedSeekbar.style.width = `${
      parseInt((position * 1000) / player.video.duration) / 10
    }%`;

    let beat = player.findBeat(position);
    // if (b !== beat) {
    //   if (beat) {
    //     requestAnimationFrame(() => {
    //       bar.className = "active";
    //       requestAnimationFrame(() => {
    //         bar.className = "active beat";
    //       });
    //     });
    //   }
    //   b = beat;
    // }

    // 歌詞情報がなければこれで処理を終わる
    if (!player.video.firstChar) {
      return;
    }

    // 巻き戻っていたら歌詞表示をリセットする
    if (c && c.startTime > position + 1000) {
      resetChars();
    }

    // 500ms先に発声される文字を取得
    let current = c || player.video.firstChar;
    while (current && current.startTime < position) {
      // 新しい文字が発声されようとしている
      if (c !== current) {
        newChar(current);
        c = current;
      }
      current = current.next;
    }
  },
  onVolumeChange() {
    // ボリューム変更
    let music_volume = document.getElementById("volume");
    console.log(elem_volume.value);
    player.volume = music_volume.value;
    document.getElementById('vol_range').innerHTML = elem_volume.value
  },

  /* 楽曲の再生が始まったら呼ばれる */
  onPlay() {
    let element = document.querySelector("#play > i");
    element.classList.replace('fa-play', 'fa-pause');
  },

  /* 楽曲の再生が止まったら呼ばれる */
  onPause() {
    const element = document.querySelector("#play > i");
    element.classList.replace('fa-pause', 'fa-play');
  },
});

// 再生ボタン
document.querySelector("#play").addEventListener(
  "click", (e) => {
    e.preventDefault();
    if (player) {
      if (player.isPlaying) {
        player.requestPause();
        const elem = document.activeElement;
        elem.blur();
        
      } else {
        player.requestPlay();
        const elem = document.activeElement;
        elem.blur();
      }
    }
    return false;
});

// 巻き戻しボタン
document.querySelector("#rewind").addEventListener(
  "click", (e) => {
    e.preventDefault();
    player.requestMediaSeek(0);
    const elem = document.activeElement;
    elem.blur();
});

// ミュートボタン
document.querySelector("#mute").addEventListener(
  "click", (e) => {
    e.preventDefault();
    player.volueme = (0);
    const elem = document.activeElement;
    elem.blur();
});

/* シークバー */
seekbar.addEventListener("click", (e) => {
  e.preventDefault();
  if (player) {
    player.requestMediaSeek(
      (player.video.duration * e.offsetX) / seekbar.clientWidth
    );
  }
  return false;
});

/**
 * 新しい文字の発声時に呼ばれる
 * Called when a new character is being vocalized
 */
 function newChar(current) {
  // 品詞 (part-of-speech)
  // https://developer.textalive.jp/packages/textalive-app-api/interfaces/iword.html#pos
  const classes = [];
  if (
    current.parent.pos === "N" ||
    current.parent.pos === "PN" ||
    current.parent.pos === "X"
  ) {
    classes.push("noun");
  }

  // フレーズの最後の文字か否か
  if (current.parent.parent.lastChar === current) {
    classes.push("lastChar");
  }

  // 英単語の最初か最後の文字か否か
  if (current.parent.language === "en") {
    if (current.parent.lastChar === current) {
      classes.push("lastCharInEnglishWord");
    } else if (current.parent.firstChar === current) {
      classes.push("firstCharInEnglishWord");
    }
  }

  // noun, lastChar クラスを必要に応じて追加
  const div = document.createElement("div");
  div.appendChild(document.createTextNode(current.text));

  // 文字を画面上に追加
  const container = document.createElement("div");
  container.className = classes.join(" ");
  container.appendChild(div);
  container.addEventListener("click", () => {
    player.requestMediaSeek(current.startTime);
  });
  textContainer.appendChild(container);
}

/**
 * 歌詞表示をリセットする
 * Reset lyrics view
 */
function resetChars() {
  c = null;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
}

// 再生が一時停止・停止したら歌詞表示をリセット
function onPause() {
  document.querySelector("#text").textContent = "";
}
function onStop() {
  document.querySelector("#text").textContent = "";
}
