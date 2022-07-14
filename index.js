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
      { title: "Gradation start color", name: "gradationStartColor", className: "Color", initialValue: "#63d0e2" },
      { title: "Gradation end color", name: "gradationEndColor", className: "Color", initialValue: "#ff9438" },
    ]
  },

  mediaElement: document.querySelector("#media"),
});

const startVideo = document.querySelector(".open");
const textContainer = document.querySelector("#lyrics");
const controlSection = document.querySelector("#control-section");
const seekbar = document.querySelector("#seekbar");
const paintedSeekbar = seekbar.querySelector("div");
const songList = document.getElementById("songSelect");
const ringArr = ['P', 'Y', 'M', 'A'];
let musicVolume = document.querySelector(`input[type='range'][id='volume']`);
let b, c;
let nounCount = 1;

console.log(textContainer);

startVideo.addEventListener('click', () => {
  // シークバーの初期化
  player.requestMediaSeek(0);
  paintedSeekbar.style.width = 0;
  // #overlay を非表示に
  setTimeout(function () {
    document.querySelector(".top").style.display = "none";
    document.querySelector(".main").style.display = "block";
  }, 600);
});
// topで使うマウスカーソル
let cursor = document.getElementById('cursor');
document.addEventListener('mousemove', (e) => {
  let x = e.clientX;
  let y = e.clientY;
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";
});
// mainで使うマウスカーソル
let cursor2 = document.getElementById('cursorB');
document.addEventListener('mousemove', (e) => {
  let x = e.clientX;
  let y = e.clientY;
  cursor2.style.left = x + "px";
  cursor2.style.top = y + "px";
});

lightingBg.addEventListener('click', () => {
  let bgColor =  ringArr[ Math.floor( Math.random() * ringArr.length ) ];
  lightingBg.className = ("lightbg"+bgColor);
});

document.body.addEventListener("click", drop, false);
function drop(e) {

  // マウスの位置
  let x = e.pageX;
  let y = e.pageY;

  // ringの座標設定
  let ring = document.createElement("div");
  ring.className = 'ring'
  ring.style.top = y + "px";
  ring.style.left = x + "px";
  document.body.appendChild(ring);

  // ランダムでringに色を付ける
  let ringColor = ringArr[ Math.floor( Math.random() * ringArr.length ) ];
  ring.className = "ring"+ringColor;


  // アニメーションが終わったリングを消す
  ring.addEventListener("animationend", () => {
      ring.remove();
  }, false);
}

// TextAlive Player
player.addListener({
  onAppReady(app) {
    // TextAlive ホストと接続されていなければ再生コントロールを表示する
    if (!app.managed) {
      document.querySelector("#control").style.display = "block";
    // }
    // if (!app.songUrl) {
    //   document.querySelector("#media").className = "disabled";

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
    paintedSeekbar.style.width = `${parseInt((position * 1000) / player.video.duration) / 10
      }%`;

    let beat = player.findBeat(position);
    if (b !== beat) {
      if (beat) {
        requestAnimationFrame(() => {
          controlSection.className = "active";
          requestAnimationFrame(() => {
            controlSection.className = "active beat";
        });
        });
      } b = beat;
    }

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
    while (current && current.startTime < position +400) {
      // 新しい文字が発声されようとしている
      if (c !== current) {
        newChar(current);
        c = current;
      }
      current = current.next;
    }
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
let firstSong = document.getElementById("song1");
let currentSong = firstSong;
firstSong.addEventListener('click', () => {
  currentSong.classList.replace('selected', 'off');
  firstSong.classList.replace('off', 'selected');
  currentSong = firstSong;
  player.requestMediaSeek(0);
  paintedSeekbar.style.width = 0;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
  // Loading Memories / せきこみごはん feat. 初音ミク
  player.createFromSongUrl("https://piapro.jp/t/RoPB/20220122172830", {
    video: {
      // 音楽地図訂正履歴: https://songle.jp/songs/2243651/history
      beatId: 4086301,
      chordId: 2221797,
      repetitiveSegmentId: 2247682,
      // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FRoPB%2F20220122172830
      lyricId: 53718,
      lyricDiffId: 7076
    }
  });
});
let secondSong = document.getElementById("song2");
secondSong.addEventListener('click', () => {
  currentSong.classList.replace('selected', 'off');
  secondSong.classList.replace('off', 'selected');
  currentSong = secondSong;
  player.requestMediaSeek(0);
  paintedSeekbar.style.width = 0;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
  // 青に溶けた風船 / シアン・キノ feat. 初音ミク
  player.createFromSongUrl("https://piapro.jp/t/9cSd/20220205030039", {
    video: {
      // 音楽地図訂正履歴: https://songle.jp/songs/2245015/history
      beatId: 4083452,
      chordId: 2221996,
      repetitiveSegmentId: 2247861,
      // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2F9cSd%2F20220205030039
      lyricId: 53745,
      lyricDiffId: 7080
    }
  });
});
let thirdSong = document.getElementById("song3");
thirdSong.addEventListener('click', () => {
  currentSong.classList.replace('selected', 'off');
  thirdSong.classList.replace('off', 'selected');
  currentSong = thirdSong;
  player.requestMediaSeek(0);
  paintedSeekbar.style.width = 0;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
  // 歌の欠片と / imo feat. MEIKO
  player.createFromSongUrl("https://piapro.jp/t/Yvi-/20220207132910", {
    video: {
      // 音楽地図訂正履歴: https://songle.jp/songs/2245016/history
      beatId: 4086832,
      chordId: 2222074,
      repetitiveSegmentId: 2247935,
      // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FYvi-%2F20220207132910
      lyricId: 53746,
      lyricDiffId: 7082
    }
  });
});
let forthSong = document.getElementById("song4");
forthSong.addEventListener('click', () => {
  currentSong.classList.replace('selected', 'off');
  forthSong.classList.replace('off', 'selected');
  currentSong = forthSong;
  player.requestMediaSeek(0);
  paintedSeekbar.style.width = 0;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
  // 未完のストーリー / 加賀（ネギシャワーP） feat. 初音ミク
  player.createFromSongUrl("https://piapro.jp/t/ehtN/20220207101534", {
    video: {
      // 音楽地図訂正履歴: https://songle.jp/songs/2245017/history
      beatId: 4083459,
      chordId: 2222147,
      repetitiveSegmentId: 2248008,
      // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FehtN%2F20220207101534
      lyricId: 53747,
      lyricDiffId: 7083
    }
  });
});
let fifthSong = document.getElementById("song5");
fifthSong.addEventListener('click', () => {
  currentSong.classList.replace('selected', 'off');
  fifthSong.classList.replace('off', 'selected');
  currentSong = fifthSong;
  player.requestMediaSeek(0);
  paintedSeekbar.style.width = 0;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
  // みはるかす / ねこむら（cat nap） feat. 初音ミク
  player.createFromSongUrl("https://piapro.jp/t/QtjE/20220207164031", {
    video: {
      // 音楽地図訂正履歴: https://songle.jp/songs/2245018/history
      beatId: 4083470,
      chordId: 2222187,
      repetitiveSegmentId: 2248075,
      // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FQtjE%2F20220207164031
      lyricId: 53748,
      lyricDiffId: 7084
    }
  });
});
let sixthSong = document.getElementById("song6");
sixthSong.addEventListener('click', () => {
  currentSong.classList.replace('selected', 'off');
  sixthSong.classList.replace('off', 'selected');
  currentSong = sixthSong;
  player.requestMediaSeek(0);
  paintedSeekbar.style.width = 0;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
  // fear / 201 feat. 初音ミク
  player.createFromSongUrl("https://piapro.jp/t/GqT2/20220129182012", {
    video: {
      // 音楽地図訂正履歴: https://songle.jp/songs/2245019/history
      beatId: 4083475,
      chordId: 2222294,
      repetitiveSegmentId: 2248170,
      // 歌詞タイミング訂正履歴: https://textalive.jp/lyrics/piapro.jp%2Ft%2FGqT2%2F20220129182012
      lyricId: 53749,
      lyricDiffId: 7085
    }
  });
});
// 再生ボタン
document.querySelector("#play").addEventListener(
  "click", (e) => {
    e.preventDefault();
    if (player) {
      if (player.isPlaying) {
        player.requestPause();
        console.log('player paused');
        const elem = document.activeElement;
        elem.blur();
      } else {
        player.requestPlay();
        console.log('player resumed');
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
    paintedSeekbar.style.width = 0;
    console.log('back to start');
    player.requestMediaSeek(0);
    paintedSeekbar.style.width = 0;
    const elem = document.activeElement;
    elem.blur();
});

// ミュートボタン
let v = 0;
document.querySelector("#mute").addEventListener(
  "click", (e) =>{
    e.preventDefault();
    if (player) {
      // 最後の音量を記録して音声をミュートする
      if (player.volume > 0) {
        v = player.volume;
        console.log('recent player volume : '+ v*2);
        player.volume = '0';
        musicVolume.value = '0';
        let element = document.querySelector("#mute > i");
        element.classList.replace('fa-volume-high', 'fa-volume-xmark');
        const elem = document.activeElement;
        elem.blur();
      // すでにミュートの場合、最後に記録した音声を取り出してミュートを解除する
      } else {
        player.volume = v;
        musicVolume.value = v;
        console.log('volume reset to '+ player.volume*2);
        let element = document.querySelector("#mute > i");
        element.classList.replace('fa-volume-xmark', 'fa-volume-high');
        const elem = document.activeElement;
        elem.blur();
      }
    }
    return false;
});

// 音量調整
player.volume = musicVolume.value;
console.log('default volume : '+ player.volume*2)

musicVolume.addEventListener(
  "change", (e) => {
    e.preventDefault();
    if (player) {
      if (player.volume == 0) {
        v = player.volume;
        console.log('recent player volume : '+ v*2);
        player.volume = musicVolume.value;
        let element = document.querySelector("#mute > i");
        element.classList.replace('fa-volume-high', 'fa-volume-xmark');
      } else {
        player.volume = musicVolume.value;
        console.log('volume set to '+ player.volume*2);
        let element = document.querySelector("#mute > i");
        element.classList.replace('fa-volume-xmark', 'fa-volume-high');
      }
    }
    return false;
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

/* 新しい文字の発声時に呼ばれる */
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
  // フレーズの最後の文字
  if (current.parent.parent.firstChar === current) {
    classes.push("firstChar");
  }
  // フレーズの最後の文字
  if (current.parent.parent.lastChar === current) {
    classes.push("lastChar");
  }
  // 英単語の最初か最後の文字
  if (current.parent.language === "en") {
    if (current.parent.lastChar === current) {
      classes.push("lastCharInEnglishWord");
    } else if (current.parent.firstChar === current) {
      classes.push("firstCharInEnglishWord");
    }
  }

  // クラスを必要に応じて追加
  const p = document.createElement("p");
  const br = document.createElement("br");
  p.appendChild(document.createTextNode(current.text));
  // 文字を画面上に追加
  p.className = classes.join(" ");
  textContainer.appendChild(p);
  if (p.classList.contains('lastChar')) {
    textContainer.appendChild(br);
  }
    // ringの座標設定
    let dot = document.createElement("div");
    dot.className = 'dot'
    dot.style.top = Math.floor( Math.random() * 800 ) + 100 + "px";
    dot.style.left = Math.floor( Math.random() * 1500 ) + 200 + "px";
    document.body.appendChild(dot);
  
    // ランダムでringに色を付ける
    let dotColor = ringArr[ Math.floor( Math.random() * ringArr.length ) ] ;
    dot.className = "dot"+dotColor;
  
    // アニメーションが終わったリングを消す
    dot.addEventListener("animationend", () => {
      dot.remove();
    });


  if (p.classList.contains('noun') || p.classList.contains('firstChar') || p.classList.contains('lastChar')) {
    // ringの座標設定
    let ring = document.createElement("div");
    ring.className = 'ring'
    ring.style.top = Math.floor( Math.random() * 520 ) + 100 + "px";
    ring.style.left = Math.floor( Math.random() * 980 ) + 200 + "px";
    document.body.appendChild(ring);
  
    // ランダムでringに色を付ける
    let ringColor = ringArr[ Math.floor( Math.random() * ringArr.length ) ] ;
    ring.className = "ring"+ringColor;
  
    // アニメーションが終わったリングを消す
    ring.addEventListener("animationend", () => {
        ring.remove();
    });
  }
}
/* 歌詞表示をリセットする */
function resetChars() {
  c = null;
  while (textContainer.firstChild)
    textContainer.removeChild(textContainer.firstChild);
}
