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
const mediaSlider = document.querySelector('#mediaSlider');
const positionEl = document.querySelector("#position");

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

let cursor2 = document.getElementById('cursor-2');
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

  // 定期的に呼ばれる各単語の "animate" 関数をセットする
    let w = player.video.firstWord;
    while (w) {
      w.animate = animateWord;
      w = w.next;
    }
  },

  onTimerReady() {
  // ボタンを有効化する
    if (!player.app.managed) {
      document.querySelector("#control > button").className = "";
      document.querySelector("#control > input").className = "";
    }
  },

  onThrottledTimeUpdate(position) {
    // 再生位置を表示する
    positionEl.textContent = String(Math.floor(position));
    // さらに精確な情報が必要な場合は `player.timer.position` でいつでも取得できます
  },

  /* 楽曲の再生が始まったら呼ばれる */
  onPlay() {
    let element = document.querySelector("#play > i");
    element.classList.replace('fa-circle-play', 'fa-circle-pause');
  },

  /* 楽曲の再生が止まったら呼ばれる */
  onPause() {
    const element = document.querySelector("#play > i");
    element.classList.replace('fa-circle-pause', 'fa-circle-play');
  },
});
// 最初の再生ボタン
// setTimeout(function(){
//   startVideo.addEventListener(
//     "click", () => player.video && player.requestPlay()
//   );
// },600);
// 再生ボタン
document.querySelector("#play > i").addEventListener(
  "click", (e) => {
    e.preventDefault();
    if (player) {
      if (player.isPlaying) {
        player.requestPause();
      } else {
        player.requestPlay();
      }
    }
    return false;
});

// メディアシークバー
mediaSlider.addEventListener(
  'change', () => player.video && player.requestMediaSeek(mediaSlider.value)
);
// 巻き戻しボタン
document.querySelector("#rewind > i").addEventListener(
  "click", (e) => {
    e.preventDefault();
    player.requestMediaSeek(0);
});
// ミュートボタン
document.querySelector("#mute > i").addEventListener(
  "click", (e) => {
    e.preventDefault();
    player.volueme = 0;
});

// ボリューム変更
let music_volume = document.getElementById("volume");
console.log(music_volume.value);
player.volume = music_volume.value;
document.getElementById('vol_range').innerHTML = music_volume.value

// 再生が一時停止・停止したら歌詞表示をリセット
function onPause() {
  document.querySelector("#text").textContent = "";
}
function onStop() {
  document.querySelector("#text").textContent = "";
}
