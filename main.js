const outputEl = document.getElementById('output');
const cmdForm = document.getElementById('cmdForm');
const cmdInput = document.getElementById('cmdInput');
const citySelect = document.getElementById('citySelect');

function printOutput(text, isCommand = false) {
  outputEl.textContent += (isCommand ? '> ' : '') + text + '\n';
  outputEl.scrollTop = outputEl.scrollHeight;
}

function formatDateTime(datetimeStr) {
  const dt = new Date(datetimeStr);
  return dt.toLocaleString('ja-JP', { hour12: false });
}

async function fetchTimeZoneData(timezone) {
  const url = `https://worldtimeapi.org/api/timezone/${encodeURIComponent(timezone)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('指定した都市の情報が見つかりませんでした。');
  return await res.json();
}

async function timeCommand(timezone) {
  printOutput(`> time ${timezone}`, true);
  try {
    const data = await fetchTimeZoneData(timezone);
    const loc = data.timezone;
    const datetime = formatDateTime(data.datetime);
    const utcOffset = data.utc_offset;
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][new Date(data.datetime).getDay()];
    printOutput(`📍 ${loc}\n🕒 現地時刻: ${datetime}\n🕒 UTC${utcOffset} | 曜日: ${dayOfWeek}`);
  } catch (e) {
    printOutput(`⚠️ エラー: ${e.message}`);
  }
}

async function tzCommand(timezone) {
  printOutput(`> tz ${timezone}`, true);
  try {
    const data = await fetchTimeZoneData(timezone);
    const loc = data.timezone;
    const utcOffset = data.utc_offset;
    const isDst = data.dst ? '夏時間適用中' : '夏時間なし';
    const date = new Date(data.datetime).toLocaleDateString('ja-JP');
    printOutput(`📍 ${loc}\n🌐 タイムゾーン: ${loc}\n⏰ UTC${utcOffset} (${isDst})\n📅 日付: ${date}`);
  } catch (e) {
    printOutput(`⚠️ エラー: ${e.message}`);
  }
}

cmdForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = cmdInput.value.trim();
  const city = citySelect.value;

  if (!input) {
    printOutput('⚠️ コマンドを入力してください。');
    return;
  }

  const [cmd, ...args] = input.split(' ');

  if (cmd.toLowerCase() === 'help') {
    printOutput('使えるコマンド一覧:\n time [都市名]\n tz [都市名]\n help');
    return;
  }

  if (!city) {
    printOutput('⚠️ 都市を選んでください。');
    return;
  }

  switch (cmd.toLowerCase()) {
    case 'time':
      await timeCommand(city);
      break;
    case 'tz':
      await tzCommand(city);
      break;
    default:
      printOutput(`⚠️ 不明なコマンド: ${cmd}\n「help」と入力するとコマンド一覧が表示されます。`);
  }

  cmdInput.value = '';
});
