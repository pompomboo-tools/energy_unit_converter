/**
 * 数値取得用ユーティリティ
 */
function getNumericValue(id) {
  const value = document.getElementById(id).value;
  const rawValue = value.replace(/,/g, '');
  if (rawValue === '' || isNaN(rawValue)) {
    return NaN;
  }
  return parseFloat(rawValue);
}

/**
 * 3桁カンマ区切りの文字列整形
 */
function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return '';
  const parts = String(value).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * 入力イベントハンドラ
 */
function handleNumberInput(input) {
  // 全角数字を半角に変換
  let val = input.value.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  
  // 数字とドット（.）以外を除去
  val = val.replace(/[^0-9.]/g, '');

  // 小数点が複数入力された場合は最初のみ保持
  const parts = val.split('.');
  if (parts.length > 2) {
    val = parts[0] + '.' + parts.slice(1).join('');
  }

  // 桁区切り処理
  if (val !== '') {
    input.value = formatNumber(val);
  } else {
    input.value = '';
  }

  calculate();
}

/**
 * モード切替（readonlyおよびplaceholderの設定）
 */
function updateCalcMode() {
  const mode = document.querySelector('input[name="calc-mode"]:checked').value;
  const targetMjInput = document.getElementById('target-mj');
  const targetM3Input = document.getElementById('target-m3');

  if (mode === 'm3') {
    // 換算後の「使用量」を自動計算（readonly）にする
    targetM3Input.readOnly = true;
    targetM3Input.tabIndex = -1;
    targetM3Input.placeholder = ''; // グレー表示時はプレースホルダー消去

    targetMjInput.readOnly = false;
    targetMjInput.removeAttribute('tabindex');
    targetMjInput.placeholder = '数値入力';
  } else {
    // 換算後の「熱量」を自動計算（readonly）にする
    targetMjInput.readOnly = true;
    targetMjInput.tabIndex = -1;
    targetMjInput.placeholder = ''; // グレー表示時はプレースホルダー消去

    targetM3Input.readOnly = false;
    targetM3Input.removeAttribute('tabindex');
    targetM3Input.placeholder = '数値入力';
  }
  
  targetMjInput.value = targetMjInput.readOnly ? '' : targetMjInput.value;
  targetM3Input.value = targetM3Input.readOnly ? '' : targetM3Input.value;
  
  calculate();
}

/**
 * クリア機能
 */
function clearAll() {
  ['base-mj', 'base-m3', 'target-mj', 'target-m3'].forEach(id => {
    document.getElementById(id).value = '';
  });
  calculate();
}

/**
 * 計算処理
 */
function calculate() {
  const mode = document.querySelector('input[name="calc-mode"]:checked').value;
  const roundType = document.querySelector('input[name="round"]:checked').value;
  
  const baseMJ = getNumericValue('base-mj');
  const baseM3 = getNumericValue('base-m3');
  const totalHeat = baseM3 * baseMJ;

  let result = NaN;
  let resultInputId = '';

  if (mode === 'm3') {
    resultInputId = 'target-m3';
    const targetMJ = getNumericValue('target-mj');
    if (!isNaN(totalHeat) && !isNaN(targetMJ) && targetMJ !== 0) {
      result = totalHeat / targetMJ;
    }
  } else {
    resultInputId = 'target-mj';
    const targetM3 = getNumericValue('target-m3');
    if (!isNaN(totalHeat) && !isNaN(targetM3) && targetM3 !== 0) {
      result = totalHeat / targetM3;
    }
  }

  const resultInput = document.getElementById(resultInputId);
  
  if (!isNaN(result)) {
    let processedResult;
    switch (roundType) {
      case 'round': processedResult = Math.round(result); break;
      case 'floor': processedResult = Math.floor(result); break;
      case 'ceil':  processedResult = Math.ceil(result); break;
      default:      processedResult = result;
    }
    resultInput.value = formatNumber(processedResult);
  } else {
    resultInput.value = '';
  }
}

// イベントリスナーの設定
window.addEventListener('DOMContentLoaded', () => {
  // 入力フォームのイベントリスナー設定
  document.querySelectorAll('.number-input').forEach(input => {
    input.addEventListener('input', (e) => handleNumberInput(e.target));
  });

  // 計算モードラジオボタンのイベントリスナー設定
  document.querySelectorAll('input[name="calc-mode"]').forEach(radio => {
    radio.addEventListener('change', updateCalcMode);
  });

  // 端数処理ラジオボタンのイベントリスナー設定
  document.querySelectorAll('input[name="round"]').forEach(radio => {
    radio.addEventListener('change', calculate);
  });

  // クリアボタンのイベントリスナー設定
  document.getElementById('clear-btn').addEventListener('click', clearAll);

  // 初期化実行
  updateCalcMode();
});