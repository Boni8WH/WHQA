// ローカルストレージのキー
const LOCAL_STORAGE_KEYS = {
    SELECTED_UNITS: 'selectedUnits',
    QUESTION_COUNT: 'questionCount',
    QUIZ_PROGRESS: 'quizProgress'
};

// アプリの要素を取得
const selectionArea = document.querySelector('.selection-area');
const chaptersContainer = document.querySelector('.chapters-container');
const startButton = document.getElementById('startButton');
const cardArea = document.querySelector('.card-area');
const questionText = document.getElementById('question');
const answerText = document.getElementById('answer');

const showAnswerButton = document.getElementById('showAnswerButton');
const correctButton = document.getElementById('correctButton');
const incorrectButton = document.getElementById('incorrectButton');

const messageText = document.getElementById('message');
const backToSelectionButton = document.getElementById('backToSelectionButton');
const backToSelectionFromCardButton = document.getElementById('backToSelectionFromCardButton');

// 進捗表示の要素を取得
const questionNumberDisplay = document.getElementById('questionNumberDisplay');
const progressBar = document.getElementById('progressBar');

// 出題数選択ラジオボタンの取得
const questionCountRadios = document.querySelectorAll('input[name="questionCount"]');

// Quiz Result Section Elements
const quizResult = document.getElementById('quizResult');
const totalQuestionsCountSpan = document.getElementById('totalQuestionsCount');
const selectedRangeTotalQuestionsSpan = document.getElementById('selectedRangeTotalQuestions'); // 追加
const correctCountSpan = document.getElementById('correctCount');
const incorrectCountSpan = document.getElementById('incorrectCount');
const accuracyRateSpan = document.getElementById('accuracyRate');
const incorrectWordListSection = document.getElementById('incorrectWordList');
const incorrectWordsContainer = document.getElementById('incorrectWordsContainer');

// 新しいボタン要素の取得
const restartQuizButton = document.getElementById('restartQuizButton');
const resetSelectionButton = document.getElementById('resetSelectionButton');
const showWeakWordsButton = document.getElementById('showWeakWordsButton');

// SNSシェアボタンの取得 (追加)
const shareXButton = document.getElementById('shareXButton');
const downloadImageButton = document.getElementById('downloadImageButton'); // 新しいダウンロードボタン

// アプリ情報関連の要素
const infoIcon = document.getElementById('infoIcon');
const infoPanel = document.getElementById('infoPanel');
const lastUpdatedDateSpan = document.getElementById('lastUpdatedDate');
const updateContentSpan = document.getElementById('updateContent');

// コマンドキー入力関連の要素
const commandInput = document.getElementById('commandInput');
const commandButton = document.getElementById('commandButton');

// コマンドキーの定義
const COMMAND_KEY = 'Avignon1309';


// 認証関連の要素を取得
const authSection = document.getElementById('authSection');
const authMessage = document.getElementById('authMessage');
const loginRegisterForm = document.getElementById('loginRegisterForm');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');
const loggedInUserArea = document.getElementById('loggedInUserArea');
const loggedInUsernameSpan = document.getElementById('loggedInUsername');
const logoutButton = document.getElementById('logoutButton');

// 苦手問題ラジオボタンを取得
const incorrectOnlyRadio = document.getElementById('incorrectOnlyRadio');

// 苦手問題一覧セクションの要素
const weakWordsListSection = document.getElementById('weakWordsListSection');
const weakWordsContainer = document.getElementById('weakWordsContainer');
const backToSelectionFromWeakListButton = document.getElementById('backToSelectionFromWeakListButton');

// ローカルストレージのユーザー情報キー
const LOCAL_STORAGE_USERS_KEY = 'quizUsers';

let currentUser = null; // 現在ログイン中のユーザー
let users = {}; // 全ユーザー情報を保持するオブジェクト { username: { passwordHash: '...', incorrectWords: [...], problemHistory: {...} } }

let wordData = []; // CSVから読み込んだ全単語データ
let chapterData = {}; // 章と単元で整理された単語データ

let currentWordIndex = 0;
let selectedWords = []; // ユーザーが選択した単元から抽出された単語
let wordsForQuiz = []; // 実際にクイズに使用される単語

let correctCount = 0;
let incorrectCount = 0;
let incorrectWords = []; // 現在のクイズセッション中の不正解単語 (currentUser.incorrectWordsとは別)

// 最後に選択された単元の番号と出題数を保存する変数 (ローカルストレージで管理するため、ここでは初期化のみ)
let lastSelectedUnitNumbers = [];
let lastSelectedQuestionCount = '10';

// アプリ情報のデータ
const appInfo = {
    lastUpdated: '2025年6月11日', // 今日の日付を記載
    updateLog: 'UIデザイン修正と苦手問題機能の改善。苦手問題一覧機能を追加。学習結果に全問題数を表示し、SNSシェアボタンを追加。' // 今回の更新内容を記載
};


// ----------------------------------------------------
// UI表示制御関数
// ----------------------------------------------------
function showSelectionArea() {
    selectionArea.classList.remove('hidden');
    cardArea.classList.add('hidden');
    quizResult.classList.add('hidden');
    weakWordsListSection.classList.add('hidden');
    messageText.classList.add('hidden');
    messageText.textContent = '';
    startButton.textContent = '学習開始';
    backToSelectionFromCardButton.classList.add('hidden');
    infoPanel.classList.add('hidden');
    authSection.classList.remove('hidden');
    updateAuthUI(); // 認証UIを更新
}

function showCardArea() {
    selectionArea.classList.add('hidden');
    cardArea.classList.remove('hidden');
    quizResult.classList.add('hidden');
    weakWordsListSection.classList.add('hidden');
    messageText.classList.add('hidden');
    messageText.textContent = '';
    backToSelectionFromCardButton.classList.remove('hidden');
    infoPanel.classList.add('hidden');
    authSection.classList.add('hidden');
}

function showQuizResult() {
    selectionArea.classList.add('hidden');
    cardArea.classList.add('hidden');
    quizResult.classList.remove('hidden');
    weakWordsListSection.classList.add('hidden');
    messageText.classList.remove('hidden');
    backToSelectionFromCardButton.classList.add('hidden');
    infoPanel.classList.add('hidden');
    authSection.classList.add('hidden');
}

// 苦手問題一覧セクションを表示する関数
function showWeakWordsListArea() {
    selectionArea.classList.add('hidden');
    cardArea.classList.add('hidden');
    quizResult.classList.add('hidden');
    weakWordsListSection.classList.remove('hidden');
    messageText.classList.add('hidden');
    backToSelectionFromCardButton.classList.add('hidden');
    infoPanel.classList.add('hidden');
    authSection.classList.add('hidden');
    displayWeakWordsList(); // 苦手問題一覧の表示ロジックを呼び出す
}


// ----------------------------------------------------
// 初期化処理：DOMが読み込まれたら単語データを読み込む
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadCurrentUser();
    showSelectionArea(); // これにより認証UIが適切に表示される

    // アプリ情報を設定
    lastUpdatedDateSpan.textContent = appInfo.lastUpdated;
    updateContentSpan.textContent = appInfo.updateLog;

    fetch('words.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(csvText => {
            wordData = parseCSV(csvText);

            if (wordData.length === 0) {
                messageText.classList.remove('hidden');
                messageText.textContent = '単語データが見つからないか、形式が不正です。CSVファイルを確認してください。';
                messageText.style.color = '#e74c3c';
                return;
            }

            chapterData = buildChapterData(wordData);
            generateChapterSelection();

            loadSelection();
            loadQuizProgress();

            document.querySelectorAll('.chapter-item').forEach(chapterItem => {
                const chapterNum = chapterItem.dataset.chapterNum;
                updateSelectAllButtonState(chapterItem, chapterNum);
            });

        })
        .catch(error => {
            console.error('単語データの読み込みに失敗しました:', error);
            messageText.classList.remove('hidden');
            messageText.textContent = '単語データの読み込みに失敗しました。';
            messageText.style.color = '#e74c3c';
            showSelectionArea();
        });
});

// ----------------------------------------------------
// UI生成関数
// ----------------------------------------------------

function buildChapterData(data) {
    const chapters = {};
    data.forEach(word => {
        const chapterNum = word.chapter;
        const unitNum = word.number;
        const unitCategory = word.category;
        const isEnabled = word.enabled === '1';

        if (!chapters[chapterNum]) {
            chapters[chapterNum] = {
                units: {},
                words: []
            };
        }
        if (!chapters[chapterNum].units[unitNum]) {
            chapters[chapterNum].units[unitNum] = {
                categoryName: unitCategory,
                words: [],
                enabled: isEnabled
            };
        }
        chapters[chapterNum].units[unitNum].words.push(word);
        chapters[chapterNum].words.push(word);
    });

    const sortedChapters = Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b));
    const sortedChapterData = {};
    sortedChapters.forEach(chapterNum => {
        sortedChapterData[chapterNum] = chapters[chapterNum];
        const sortedUnitNumbers = Object.keys(chapters[chapterNum].units).sort((a, b) => parseInt(a) - parseInt(b));
        const sortedUnits = {};
        sortedUnitNumbers.forEach(unitNum => {
            sortedUnits[unitNum] = chapters[chapterNum].units[unitNum];
        });
        sortedChapterData[chapterNum].units = sortedUnits;
    });

    return sortedChapterData;
}


function generateChapterSelection() {
    chaptersContainer.innerHTML = '';

    for (const chapterNum in chapterData) {
        const chapter = chapterData[chapterNum];

        const chapterItem = document.createElement('div');
        chapterItem.className = 'chapter-item';
        chapterItem.dataset.chapterNum = chapterNum;

        const chapterHeader = document.createElement('div');
        chapterHeader.className = 'chapter-header';
        chapterHeader.innerHTML = `
            <span class="chapter-title">第${chapterNum}章</span>
            <div class="chapter-options">
                <button class="select-all-chapter-btn" data-chapter="${chapterNum}">全て選択</button>
                <span class="toggle-icon">▶</span>
            </div>
        `;
        chapterItem.appendChild(chapterHeader);

        const unitList = document.createElement('div');
        unitList.className = 'unit-list';

        for (const unitNum in chapter.units) {
            const unit = chapter.units[unitNum];
            const isUnitEnabled = unit.enabled;

            const unitItem = document.createElement('div');
            unitItem.className = 'unit-item';
            unitItem.innerHTML = `
                <input type="checkbox" id="unit-${chapterNum}-${unitNum}" value="${unitNum}" data-chapter="${chapterNum}" ${isUnitEnabled ? '' : 'disabled'}>
                <label for="unit-${chapterNum}-${unitNum}">${unitNum}. ${unit.categoryName} ${isUnitEnabled ? '' : '(利用不可)'}</label>
            `;
            unitList.appendChild(unitItem);

            const unitCheckbox = unitItem.querySelector(`#unit-${chapterNum}-${unitNum}`);
            unitCheckbox.addEventListener('change', () => {
                updateSelectAllButtonState(chapterItem, chapterNum);
                saveSelection();
            });
        }
        chapterItem.appendChild(unitList);
        chaptersContainer.appendChild(chapterItem);

        updateSelectAllButtonState(chapterItem, chapterNum);

        chapterHeader.addEventListener('click', (event) => {
            if (!event.target.closest('.select-all-chapter-btn')) {
                chapterHeader.classList.toggle('expanded');
            }
        });

        const selectAllButton = chapterHeader.querySelector('.select-all-chapter-btn');
        const hasSelectableUnits = Object.values(chapter.units).some(unit => unit.enabled);

        if (!hasSelectableUnits) {
            selectAllButton.disabled = true;
            selectAllButton.textContent = '選択不可';
        } else {
            selectAllButton.addEventListener('click', (event) => {
                event.stopPropagation();

                const allUnitCheckboxes = chapterItem.querySelectorAll('.unit-list input[type="checkbox"]:not([disabled])');
                const isAllChecked = Array.from(allUnitCheckboxes).every(cb => cb.checked);

                allUnitCheckboxes.forEach(checkbox => {
                    checkbox.checked = !isAllChecked;
                });
                updateSelectAllButtonState(chapterItem, chapterNum);
                saveSelection();
            });
        }
    }

    questionCountRadios.forEach(radio => {
        radio.addEventListener('change', saveSelection);
    });
}

function updateSelectAllButtonState(chapterItemElement, chapterNum) {
    const allUnitCheckboxes = chapterItemElement.querySelectorAll('.unit-list input[type="checkbox"]:not([disabled])');
    const selectAllButton = chapterItemElement.querySelector('.select-all-chapter-btn');

    if (!selectAllButton) {
        return;
    }

    if (allUnitCheckboxes.length === 0) {
        selectAllButton.classList.remove('selected-all');
        selectAllButton.textContent = '選択不可';
        selectAllButton.disabled = true;
        return;
    }

    const checkedCount = Array.from(allUnitCheckboxes).filter(cb => cb.checked).length;

    const isAllSelected = checkedCount === allUnitCheckboxes.length;

    if (isAllSelected) {
        selectAllButton.classList.add('selected-all');
        selectAllButton.textContent = '選択解除';
        selectAllButton.disabled = false;
    } else {
        selectAllButton.classList.remove('selected-all');
        selectAllButton.textContent = '全て選択';
        selectAllButton.disabled = false;
    }
}


// ----------------------------------------------------
// ローカルストレージ関連関数
// ----------------------------------------------------

function hashPassword(password) {
    return btoa(password);
}

function loadUsers() {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (storedUsers) {
        users = JSON.parse(storedUsers);
        // 既存ユーザーにproblemHistoryがなければ初期化
        for (const username in users) {
            if (!users[username].problemHistory) {
                users[username].problemHistory = {};
            }
        }
    } else {
        users = {};
    }
}

function saveUsers() {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser && users[savedUser]) {
        currentUser = users[savedUser];
        // problemHistoryがない場合は初期化
        if (!currentUser.problemHistory) {
            currentUser.problemHistory = {};
        }
    } else {
        currentUser = null;
    }
}

function saveCurrentUser() {
    if (currentUser) {
        localStorage.setItem('currentUser', currentUser.username);
    } else {
        localStorage.removeItem('currentUser');
    }
}

function updateAuthUI() {
    usernameInput.value = '';
    passwordInput.value = '';
    if (currentUser) {
        authMessage.textContent = '';
        loginRegisterForm.classList.add('hidden');
        loggedInUserArea.classList.remove('hidden');
        loggedInUsernameSpan.textContent = currentUser.username;
        // ログイン中は苦手問題ラジオボタンを有効にする
        incorrectOnlyRadio.disabled = false;
        // ログイン中は苦手問題一覧ボタンを有効にする
        showWeakWordsButton.classList.remove('hidden'); // ボタンを表示
        showWeakWordsButton.disabled = false;
    } else {
        authMessage.textContent = 'ログインして苦手問題に取り組もう！';
        authMessage.style.color = '#0050b3';
        loginRegisterForm.classList.remove('hidden');
        loggedInUserArea.classList.add('hidden');
        // ログインしていない場合は苦手問題ラジオボタンを無効にする
        incorrectOnlyRadio.disabled = true;
        // ログインしていない場合は苦手問題一覧ボタンを非表示にする
        showWeakWordsButton.classList.add('hidden'); // ボタンを非表示
        showWeakWordsButton.disabled = true;
        // ログインしていないのに苦手問題が選択されていたら10問に戻す
        if (incorrectOnlyRadio.checked) {
            document.querySelector('input[name="questionCount"][value="10"]').checked = true;
        }
    }
}

function login() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        authMessage.textContent = 'アカウント名とパスワードを入力してください。';
        authMessage.style.color = '#e74c3c';
        return;
    }

    const passwordHash = hashPassword(password);

    if (users[username] && users[username].passwordHash === passwordHash) {
        currentUser = users[username];
        // ログイン時にproblemHistoryがない場合は初期化
        if (!currentUser.problemHistory) {
            currentUser.problemHistory = {};
        }
        saveCurrentUser();
        updateAuthUI();
        authMessage.textContent = `ログインしました。ようこそ、${currentUser.username}さん！`;
        authMessage.style.color = '#27ae60';
        loadQuizProgress();
        loadSelection();
    } else {
        authMessage.textContent = 'アカウント名またはパスワードが正しくありません。';
        authMessage.style.color = '#e74c3c';
    }
}

function register() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        authMessage.textContent = 'アカウント名とパスワードを入力してください。';
        authMessage.style.color = '#e74c3c';
        return;
    }

    if (users[username]) {
        authMessage.textContent = 'このアカウント名はすでに使用されています。';
        authMessage.style.color = '#e74c3c';
        return;
    }

    const passwordHash = hashPassword(password);
    users[username] = {
        username: username,
        passwordHash: passwordHash,
        incorrectWords: [],
        problemHistory: {} // 新規登録時に問題履歴を初期化
    };
    saveUsers();
    currentUser = users[username];
    saveCurrentUser();
    updateAuthUI();
    authMessage.textContent = `新規登録しました。ようこそ、${currentUser.username}さん！`;
    authMessage.style.color = '#27ae60';
    loadQuizProgress();
    loadSelection();
}

function logout() {
    currentUser = null;
    saveCurrentUser();
    updateAuthUI();
    authMessage.textContent = 'ログアウトしました。';
    authMessage.style.color = '#3498db';
    clearQuizProgress();
    loadSelection();
}


function saveSelection() {
    const selectedUnitNumbers = Array.from(document.querySelectorAll('.unit-list input[type="checkbox"]:checked:not([disabled])'))
                                        .map(checkbox => checkbox.value);

    const selectedCount = document.querySelector('input[name="questionCount"]:checked').value;

    if (currentUser) {
        localStorage.setItem(`selectedUnits_${currentUser.username}`, JSON.stringify(selectedUnitNumbers));
        localStorage.setItem(`questionCount_${currentUser.username}`, selectedCount);
        // 汎用キーは念のため削除
        localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_UNITS);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.QUESTION_COUNT);
    } else {
        localStorage.setItem(LOCAL_STORAGE_KEYS.SELECTED_UNITS, JSON.stringify(selectedUnitNumbers));
        localStorage.setItem(LOCAL_STORAGE_KEYS.QUESTION_COUNT, selectedCount);
    }
}

function loadSelection() {
    let savedUnits = null;
    let savedCount = null;

    if (currentUser) {
        savedUnits = localStorage.getItem(`selectedUnits_${currentUser.username}`);
        savedCount = localStorage.getItem(`questionCount_${currentUser.username}`);
    } else {
        savedUnits = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_UNITS);
        savedCount = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTION_COUNT);
    }

    if (savedUnits) {
        const selectedUnitNumbers = JSON.parse(savedUnits);
        document.querySelectorAll('.unit-list input[type="checkbox"]').forEach(checkbox => {
            if (!checkbox.disabled) {
                checkbox.checked = selectedUnitNumbers.includes(checkbox.value);
            } else {
                checkbox.checked = false;
            }
        });
        document.querySelectorAll('.chapter-item').forEach(chapterItem => {
            const chapterNum = chapterItem.dataset.chapterNum;
            updateSelectAllButtonState(chapterItem, chapterNum);
        });
    } else {
        document.querySelectorAll('.unit-list input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('.chapter-item').forEach(chapterItem => {
            const chapterNum = chapterItem.dataset.chapterNum;
            updateSelectAllButtonState(chapterItem, chapterNum);
        });
    }

    if (savedCount) {
        const radio = document.querySelector(`input[name="questionCount"][value="${savedCount}"]`);
        if (radio) {
            radio.checked = true;
        }
    } else {
        document.querySelector('input[name="questionCount"][value="10"]').checked = true;
    }
    // ログイン状態に応じて苦手問題ラジオボタンの有効/無効を切り替える
    incorrectOnlyRadio.disabled = !currentUser;
    if (!currentUser && incorrectOnlyRadio.checked) {
        document.querySelector('input[name="questionCount"][value="10"]').checked = true;
    }
}


function loadQuizProgress() {
    let savedProgress = null;
    if (currentUser && currentUser.username) {
        savedProgress = localStorage.getItem(`quizProgress_${currentUser.username}`);
    } else {
        savedProgress = localStorage.getItem(LOCAL_STORAGE_KEYS.QUIZ_PROGRESS);
    }

    if (savedProgress) {
        const progress = JSON.parse(savedProgress);

        const isValidProgress = progress.wordsForQuiz && progress.wordsForQuiz.every(savedWord =>
            wordData.some(currentWord =>
                currentWord.chapter === savedWord.chapter &&
                currentWord.number === savedWord.number &&
                currentWord.question === savedWord.question &&
                currentWord.enabled === '1'
            )
        );

        if (isValidProgress && progress.wordsForQuiz.length > 0 && progress.currentWordIndex < progress.wordsForQuiz.length) {
            if (currentUser === null || confirm(`[${currentUser.username || 'ゲスト'}]前回の学習の続きから再開しますか？`)) {
                currentWordIndex = progress.currentWordIndex;
                correctCount = progress.correctCount;
                incorrectCount = progress.incorrectCount;
                incorrectWords = progress.incorrectWords || [];
                wordsForQuiz = progress.wordsForQuiz;

                lastSelectedUnitNumbers = Array.from(new Set(wordsForQuiz.map(word => word.number)));
                // 苦手問題モードの保存も考慮
                lastSelectedQuestionCount = (wordsForQuiz[0] && wordsForQuiz[0].hasOwnProperty('_correctStreak')) ? 'incorrectOnly' : ((wordsForQuiz.length === selectedWords.length) ? 'all' : wordsForQuiz.length.toString());


                showCardArea();
                displayCurrentWord();
            } else {
                clearQuizProgress();
            }
        } else {
            clearQuizProgress();
        }
    }
}

function saveQuizProgress() {
    if (!currentUser) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.QUIZ_PROGRESS);
        return;
    }

    const progress = {
        currentWordIndex: currentWordIndex,
        correctCount: correctCount,
        incorrectCount: incorrectCount,
        incorrectWords: incorrectWords,
        wordsForQuiz: wordsForQuiz
    };
    localStorage.setItem(`quizProgress_${currentUser.username}`, JSON.stringify(progress));
    localStorage.removeItem(LOCAL_STORAGE_KEYS.QUIZ_PROGRESS); // 汎用キーは念のため削除
}

function clearQuizProgress() {
    if (currentUser) {
        localStorage.removeItem(`quizProgress_${currentUser.username}`);
    } else {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.QUIZ_PROGRESS);
    }
}


// ----------------------------------------------------
// イベントリスナーの追加
// ----------------------------------------------------

loginButton.addEventListener('click', login);
registerButton.addEventListener('click', register);
logoutButton.addEventListener('click', logout);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') passwordInput.focus();
});
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') login();
});

startButton.addEventListener('click', () => {
    let selectedCount = document.querySelector('input[name="questionCount"]:checked').value;

    // 苦手問題モードの処理を追加
    if (selectedCount === 'incorrectOnly') {
        if (!currentUser) {
            alert('苦手問題に取り組むにはログインが必要です。');
            return;
        }
        if (currentUser.incorrectWords.length === 0) {
            alert('苦手問題がありません。通常の学習で間違えた問題がここに表示されます。');
            return;
        }
        // 苦手問題モードの場合、wordsForQuizをcurrentUser.incorrectWordsから作成
        wordsForQuiz = currentUser.incorrectWords.map(iw => {
            const originalWord = wordData.find(wd =>
                wd.chapter === iw.chapter &&
                wd.number === iw.number &&
                wd.question === iw.question
            );
            // 元の単語オブジェクトに、苦手問題固有のプロパティを付与して返す
            return originalWord ? { ...originalWord, _incorrectAttempts: iw.incorrectAttempts, _correctStreak: iw.correctStreak } : null;
        }).filter(word => word !== null); // 見つからない場合は除外

        shuffleArray(wordsForQuiz);

        // 苦手問題モードでは章選択の保存はしない（意味がないため）
        lastSelectedUnitNumbers = [];
        lastSelectedQuestionCount = 'incorrectOnly';
        saveSelection();

    } else { // 通常の出題モード
        const selectedUnitNumbers = Array.from(document.querySelectorAll('.unit-list input[type="checkbox"]:checked:not([disabled])'))
                                            .map(checkbox => checkbox.value);

        if (selectedUnitNumbers.length === 0) {
            alert('出題範囲（単元）を一つ以上選択してください。');
            return;
        }

        selectedWords = wordData.filter(word => selectedUnitNumbers.includes(word.number) && word.enabled === '1');

        if (selectedWords.length === 0) {
            alert('選択された範囲に有効な単語がありません。');
            return;
        }

        lastSelectedUnitNumbers = selectedUnitNumbers;
        lastSelectedQuestionCount = selectedCount;
        saveSelection();

        shuffleArray(selectedWords);

        if (selectedCount === 'all') {
            wordsForQuiz = [...selectedWords];
        } else {
            const count = parseInt(selectedCount, 10);
            wordsForQuiz = selectedWords.slice(0, count);
            if (wordsForQuiz.length < count) {
                alert(`選択された単語が${count}問に満たないため、${wordsForQuiz.length}問出題します。`);
            }
        }

        if (wordsForQuiz.length === 0) {
            alert('選択された範囲と出題数で問題を作成できませんでした。有効な単語がありません。');
            return;
        }
    }

    currentWordIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    incorrectWords = [];
    incorrectWordsContainer.innerHTML = '';

    showCardArea();
    displayCurrentWord();
    saveQuizProgress();
});

showAnswerButton.addEventListener('click', () => {
    answerText.classList.remove('hidden');
    showAnswerButton.classList.add('hidden');
    correctButton.classList.remove('hidden');
    incorrectButton.classList.remove('hidden');
});

correctButton.addEventListener('click', () => {
    correctCount++;
    recordCorrectAnswer(wordsForQuiz[currentWordIndex]); // 苦手問題の連続正解を記録する関数呼び出し & problemHistoryも更新
    goToNextWord();
    saveQuizProgress();
});

incorrectButton.addEventListener('click', () => {
    incorrectCount++;
    incorrectWords.push(wordsForQuiz[currentWordIndex]);
    recordIncorrectAnswer(wordsForQuiz[currentWordIndex]); // 苦手問題を記録する関数呼び出し & problemHistoryも更新
    goToNextWord();
    saveQuizProgress();
});

backToSelectionButton.addEventListener('click', () => {
    showSelectionArea();
    incorrectWordsContainer.innerHTML = '';
    clearQuizProgress();
    // ユーザー情報を再ロードして、苦手問題リストの変更を反映させる
    loadUsers();
    loadCurrentUser();
    updateAuthUI();
});

backToSelectionFromCardButton.addEventListener('click', () => {
    showSelectionArea();
    clearQuizProgress();
    // ユーザー情報を再ロードして、苦手問題リストの変更を反映させる
    loadUsers();
    loadCurrentUser();
    updateAuthUI();
});

restartQuizButton.addEventListener('click', () => {
    startQuizWithLastSelection();
    clearQuizProgress();
    // ユーザー情報を再ロードして、苦手問題リストの変更を反映させる
    loadUsers();
    loadCurrentUser();
    updateAuthUI();
});

resetSelectionButton.addEventListener('click', () => {
    document.querySelectorAll('.unit-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.chapter-item').forEach(chapterItem => {
        const chapterNum = chapterItem.dataset.chapterNum;
        updateSelectAllButtonState(chapterItem, chapterNum);
    });

    document.querySelector('input[name="questionCount"][value="10"]').checked = true;
    saveSelection();
    clearQuizProgress();
});

infoIcon.addEventListener('click', () => {
    infoPanel.classList.toggle('hidden');
});

commandButton.addEventListener('click', () => {
    handleCommandInput();
});

commandInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleCommandInput();
    }
});

// 苦手問題一覧ボタンのイベントリスナー
showWeakWordsButton.addEventListener('click', () => {
    if (!currentUser) {
        alert('苦手問題一覧を見るにはログインが必要です。');
        return;
    }
    showWeakWordsListArea();
});

// 苦手問題一覧からの戻るボタン
backToSelectionFromWeakListButton.addEventListener('click', () => {
    showSelectionArea();
});

shareXButton.addEventListener('click', () => {
    const text = generateShareText();
    const url = encodeURIComponent(window.location.href); // アプリのURL
    const hashtags = encodeURIComponent('KTKの世界史単語帳'); // ハッシュタグ
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}&hashtags=${hashtags}`;
    window.open(twitterUrl, '_blank');
});

// 画像ダウンロードボタンのイベントリスナー (downloadImageButtonに統合)
downloadImageButton.addEventListener('click', () => {
    const quizResultContent = document.getElementById('quizResultContent'); // 学習結果の主要コンテンツ
    const originalText = generateShareText(); // 生成済みのテキスト
    const resultButtonsDiv = document.querySelector('#quizResult .result-buttons'); // ボタンを含む要素
    const incorrectWordListSection = document.getElementById('incorrectWordList'); // 間違えた問題一覧セクション

    // シェアテキストを一時的に追加
    const shareTextElement = document.createElement('p');
    shareTextElement.id = 'tempShareTextForImage';
    shareTextElement.style.marginTop = '20px';
    shareTextElement.style.padding = '15px';
    shareTextElement.style.backgroundColor = '#f9f9f9';
    shareTextElement.style.border = '1px dashed #ddd';
    shareTextElement.style.borderRadius = '8px';
    shareTextElement.style.textAlign = 'left';
    shareTextElement.style.fontSize = '0.9em';
    shareTextElement.style.whiteSpace = 'normal';
    shareTextElement.style.wordBreak = 'break-word';

    // quizResultContent の直後に挿入 (quizResultContent の親要素の子として)
    quizResultContent.parentNode.insertBefore(shareTextElement, quizResultContent.nextSibling);

    // 生成するテキストコンテンツ（改行を <br> に置換してより見た目を近づける）
    const shareTextForImage = originalText.replace(/\n/g, '<br>') + '<br><br>#KTKの世界史単語帳';
    shareTextElement.innerHTML = shareTextForImage;

    // ボタンと間違えた問題一覧セクションを一時的に非表示にする
    if (resultButtonsDiv) {
        resultButtonsDiv.style.display = 'none'; // <-- ここを修正
    }
    if (incorrectWordListSection) {
        incorrectWordListSection.style.display = 'none'; // <-- ここを修正
    }

    // quizResult の親要素 (学習結果全体) をキャプチャ対象とする
    const captureTarget = document.getElementById('quizResult');

    html2canvas(captureTarget, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
    }).then(canvas => {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = '世界史単語帳_学習結果.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 生成後に一時的な要素を削除
        shareTextElement.parentNode.removeChild(shareTextElement);

        // ボタンと間違えた問題一覧セクションを再表示する
        if (resultButtonsDiv) {
            resultButtonsDiv.style.display = 'flex'; // <-- ここを修正 (ボタンはflexboxで配置されている可能性が高いため)
        }
        if (incorrectWordListSection) {
            incorrectWordListSection.style.display = 'block'; // <-- ここを修正 (通常はblock要素)
        }
    }).catch(error => {
        console.error('画像生成に失敗しました:', error);
        alert('画像生成に失敗しました。お使いのブラウザではこの機能がサポートされていない可能性があります。');
        // エラー時も一時的な要素を削除
        if (shareTextElement.parentNode) {
            shareTextElement.parentNode.removeChild(shareTextElement);
        }
        // エラー時もボタンと間違えた問題一覧セクションを再表示する
        if (resultButtonsDiv) {
            resultButtonsDiv.style.display = 'flex'; // <-- ここを修正
        }
        if (incorrectWordListSection) {
            incorrectWordListSection.style.display = 'block'; // <-- ここを修正
        }
    });
});


// ----------------------------------------------------
// ヘルパー関数
// ----------------------------------------------------

function goToNextWord() {
    currentWordIndex++;

    if (currentWordIndex < wordsForQuiz.length) {
        displayCurrentWord();
    } else {
        endQuiz();
    }
}

function displayCurrentWord() {
    const currentWord = wordsForQuiz[currentWordIndex];
    questionText.textContent = currentWord.question;
    answerText.textContent = currentWord.answer;

    answerText.classList.add('hidden');
    showAnswerButton.classList.remove('hidden');
    correctButton.classList.add('hidden');
    incorrectButton.classList.add('hidden');

    const totalQuestions = wordsForQuiz.length;
    const currentQuestionNum = currentWordIndex + 1;
    questionNumberDisplay.textContent = `${currentQuestionNum} / ${totalQuestions} 問`;
    const progressPercentage = (currentQuestionNum / totalQuestions) * 100;
    progressBar.style.width = `${progressPercentage}%`;
}

function endQuiz() {
    showQuizResult();

    const totalQuestions = correctCount + incorrectCount;
    totalQuestionsCountSpan.textContent = totalQuestions;
    correctCountSpan.textContent = correctCount;
    incorrectCountSpan.textContent = incorrectCount;
    const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0;
    accuracyRateSpan.textContent = `${accuracy}`;

    // 指定範囲の全問題数を表示 (追加)
    // 選択された単元に基づいて、有効な単語の総数をカウント
    const selectedUnitNumbers = Array.from(document.querySelectorAll('.unit-list input[type="checkbox"]:checked:not([disabled])'))
                                        .map(checkbox => checkbox.value);
    const totalWordsInSelectedRange = wordData.filter(word => selectedUnitNumbers.includes(word.number) && word.enabled === '1').length;
    selectedRangeTotalQuestionsSpan.textContent = totalWordsInSelectedRange;

    incorrectWordsContainer.innerHTML = '';
    if (incorrectWords.length > 0) {
        incorrectWordListSection.classList.remove('hidden');
        incorrectWords.forEach(word => {
            const listItem = document.createElement('li');

            const questionSpan = document.createElement('span');
            questionSpan.className = 'incorrect-question';
            questionSpan.textContent = word.question;

            const answerContainer = document.createElement('div');
            answerContainer.className = 'incorrect-answer-container';

            const answerSpan = document.createElement('span');
            answerSpan.className = 'incorrect-answer hidden';
            answerSpan.textContent = word.answer;

            const showAnswerBtn = document.createElement('button');
            showAnswerBtn.className = 'show-incorrect-answer-button secondary-button';
            showAnswerBtn.textContent = '答えを見る';

            showAnswerBtn.addEventListener('click', () => {
                answerSpan.classList.remove('hidden');
                showAnswerBtn.classList.add('hidden');
            });

            answerContainer.appendChild(answerSpan);
            answerContainer.appendChild(showAnswerBtn);

            listItem.appendChild(questionSpan);
            listItem.appendChild(answerContainer);
            incorrectWordsContainer.appendChild(listItem);
        });
    } else {
        incorrectWordListSection.classList.add('hidden');
    }

    messageText.textContent = `学習終了！${totalQuestions}問を学習しました。`;
    messageText.style.color = '#27ae60';
    clearQuizProgress();

    // クイズ終了時にもユーザー情報を再ロードして、苦手問題リストの変更を反映させる
    loadUsers();
    loadCurrentUser();
    updateAuthUI();
}


function startQuizWithLastSelection() {
    let savedUnits, savedCount;
    if (currentUser) {
        savedUnits = localStorage.getItem(`selectedUnits_${currentUser.username}`);
        savedCount = localStorage.getItem(`questionCount_${currentUser.username}`);
    } else {
        savedUnits = localStorage.getItem(LOCAL_STORAGE_KEYS.SELECTED_UNITS);
        savedCount = localStorage.getItem(LOCAL_STORAGE_KEYS.QUESTION_COUNT);
    }

    if (!savedUnits || !savedCount) {
        alert('前回の学習範囲が見つかりません。範囲選択画面に戻ります。');
        showSelectionArea();
        return;
    }

    lastSelectedUnitNumbers = JSON.parse(savedUnits);
    lastSelectedQuestionCount = savedCount;

    // 苦手問題モードの処理を追加
    if (lastSelectedQuestionCount === 'incorrectOnly') {
        if (!currentUser) {
            alert('苦手問題に取り組むにはログインが必要です。');
            showSelectionArea();
            return;
        }
        if (currentUser.incorrectWords.length === 0) {
            alert('苦手問題がありません。通常の学習で間違えた問題がここに表示されます。');
            showSelectionArea();
            return;
        }
        wordsForQuiz = currentUser.incorrectWords.map(iw => {
            const originalWord = wordData.find(wd =>
                wd.chapter === iw.chapter &&
                wd.number === iw.number &&
                wd.question === iw.question
            );
            return originalWord ? { ...originalWord, _incorrectAttempts: iw.incorrectAttempts, _correctStreak: iw.correctStreak } : null;
        }).filter(word => word !== null);

        shuffleArray(wordsForQuiz);

        lastSelectedUnitNumbers = [];
        lastSelectedQuestionCount = 'incorrectOnly';
        saveSelection();

    } else {
        selectedWords = wordData.filter(word => lastSelectedUnitNumbers.includes(word.number) && word.enabled === '1');

        if (selectedWords.length === 0) {
            alert('選択された範囲に有効な単語がありません。範囲選択画面に戻ります。');
            showSelectionArea();
            return;
        }

        shuffleArray(selectedWords);

        if (lastSelectedQuestionCount === 'all') {
            wordsForQuiz = [...selectedWords];
        } else {
            const count = parseInt(lastSelectedQuestionCount, 10);
            wordsForQuiz = selectedWords.slice(0, count);
            if (wordsForQuiz.length < count) {
                alert(`選択された単語が${count}問に満たないため、${wordsForQuiz.length}問出題します。`);
            }
        }
    }

    if (wordsForQuiz.length === 0) {
        alert('問題を作成できませんでした。有効な単語がありません。');
        showSelectionArea();
        return;
    }

    currentWordIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    incorrectWords = [];
    incorrectWordsContainer.innerHTML = '';

    showCardArea();
    displayCurrentWord();
    saveQuizProgress();
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
        console.warn("CSVファイルが空か、ヘッダー行のみです。");
        return [];
    }

    const headers = lines[0].split(',').map(header => header.trim());

    const result = [];
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        const values = parseCSVLine(lines[i]);
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = values[j] ? values[j].trim() : '';
        }
        // chapter, number, category, question, answer は必須とする
        if (obj.chapter && obj.number && obj.category && obj.question && obj.answer) {
            if (obj.enabled === undefined || obj.enabled === null || obj.enabled === '') {
                obj.enabled = '1'; // enabledがない場合はデフォルトで'1' (有効)
            }
            result.push(obj);
        } else {
            console.warn(`不正なデータ形式の行をスキップしました: ${lines[i]}`);
        }
    }
    return result;
}

function parseCSVLine(line) {
    const values = [];
    let inQuote = false;
    let currentVal = '';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuote && i + 1 < line.length && line[i + 1] === '"') {
                currentVal += '"';
                i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (char === ',' && !inQuote) {
            values.push(currentVal);
            currentVal = '';
        } else {
            currentVal += char;
        }
    }
    values.push(currentVal);
    return values;
}

function handleCommandInput() {
    const inputKey = commandInput.value.trim();
    if (inputKey === COMMAND_KEY) {
        unlockAllUnits();
        alert('全ての単元のロックが解除されました！');
        commandInput.value = '';
        if (!selectionArea.classList.contains('hidden')) {
            generateChapterSelection();
            loadSelection();
        }
    } else {
        alert('コマンドキーが正しくありません。');
        commandInput.value = '';
    }
}

function unlockAllUnits() {
    wordData.forEach(word => {
        word.enabled = '1';
    });

    for (const chapterNum in chapterData) {
        for (const unitNum in chapterData[chapterNum].units) {
            chapterData[chapterNum].units[unitNum].enabled = true;
        }
    }

    localStorage.removeItem(LOCAL_STORAGE_KEYS.SELECTED_UNITS);

    for (const username in users) {
        localStorage.removeItem(`selectedUnits_${username}`);
        localStorage.removeItem(`questionCount_${username}`);
    }
}

/**
 * 問題のユニークなIDを生成するヘルパー関数
 * @param {Object} word - 単語オブジェクト
 * @returns {string} - 問題のユニークID (例: chX-uY-questionText)
 */
function getProblemId(word) {
    // chapter, number, question を結合してユニークなIDを生成
    // スペースや特殊文字が含まれる可能性を考慮し、シンプルな結合にする
    return `${word.chapter}_${word.number}_${word.question.replace(/\s/g, '_').replace(/[^\w-]/g, '').substring(0, 50)}`;
}


/**
 * ユーザーの苦手問題リストに不正解の問題を記録し、問題履歴を更新する。
 * @param {Object} word - 不正解だった単語オブジェクト。
 */
function recordIncorrectAnswer(word) {
    if (!currentUser) return;

    // 苦手問題リストを更新
    const existingIncorrectWord = currentUser.incorrectWords.find(iw =>
        iw.chapter === word.chapter && iw.number === word.number && iw.question === word.question
    );

    if (existingIncorrectWord) {
        existingIncorrectWord.incorrectAttempts = (existingIncorrectWord.incorrectAttempts || 0) + 1;
        existingIncorrectWord.correctStreak = 0;
    } else {
        currentUser.incorrectWords.push({
            chapter: word.chapter,
            number: word.number,
            question: word.question,
            answer: word.answer,
            incorrectAttempts: 1,
            correctStreak: 0
        });
    }

    // problemHistoryを更新
    const problemId = getProblemId(word);
    if (!currentUser.problemHistory[problemId]) {
        currentUser.problemHistory[problemId] = { total: 0, correct: 0 };
    }
    currentUser.problemHistory[problemId].total++;

    saveUsers();
}

/**
 * ユーザーの苦手問題リストにある問題の連続正解数を更新し、問題履歴を更新する。
 * @param {Object} word - 正解した単語オブジェクト。
 */
function recordCorrectAnswer(word) {
    if (!currentUser) return;

    // 苦手問題リストを更新
    const existingIncorrectWordIndex = currentUser.incorrectWords.findIndex(iw =>
        iw.chapter === word.chapter && iw.number === word.number && iw.question === word.question
    );

    if (existingIncorrectWordIndex !== -1) {
        const existingIncorrectWord = currentUser.incorrectWords[existingIncorrectWordIndex];
        existingIncorrectWord.correctStreak = (existingIncorrectWord.correctStreak || 0) + 1;

        // 2回連続正解したら苦手問題リストから削除
        if (existingIncorrectWord.correctStreak >= 2) {
            currentUser.incorrectWords.splice(existingIncorrectWordIndex, 1);
            messageText.classList.remove('hidden');
            messageText.textContent = `「${word.question}」を克服！苦手問題から削除しました！`;
            messageText.style.color = '#27ae60';
            setTimeout(() => {
                messageText.classList.add('hidden');
            }, 3000);
        }
    }

    // problemHistoryを更新
    const problemId = getProblemId(word);
    if (!currentUser.problemHistory[problemId]) {
        currentUser.problemHistory[problemId] = { total: 0, correct: 0 };
    }
    currentUser.problemHistory[problemId].total++;
    currentUser.problemHistory[problemId].correct++;

    saveUsers();
}

/**
 * ユーザーの苦手問題一覧を表示する関数
 */
function displayWeakWordsList() {
    weakWordsContainer.innerHTML = '';

    if (!currentUser || Object.keys(currentUser.problemHistory).length === 0) {
        weakWordsContainer.innerHTML = '<p style="text-align: center; color: #777; margin-top: 20px;">まだ解答履歴がありません。学習を開始して苦手問題を記録しましょう！</p>';
        return;
    }

    const weakProblems = [];
    for (const problemId in currentUser.problemHistory) {
        const history = currentUser.problemHistory[problemId];
        // problemHistoryに問題が記録されているが、wordDataに存在しない場合はスキップ (CSV更新などで消えた場合)
        const originalWord = wordData.find(wd => getProblemId(wd) === problemId);
        if (!originalWord) continue;

        const accuracy = history.total > 0 ? (history.correct / history.total) : 0;
        weakProblems.push({
            question: originalWord.question,
            answer: originalWord.answer,
            total: history.total,
            correct: history.correct,
            accuracy: accuracy
        });
    }

    // 正答率が低い順にソート。正答率が同じ場合は総回答数が多い方を優先（より多く間違えている）
    weakProblems.sort((a, b) => {
        if (a.accuracy !== b.accuracy) {
            return a.accuracy - b.accuracy;
        }
        return b.total - a.total;
    });

    const top20WeakProblems = weakProblems.slice(0, 20);

    if (top20WeakProblems.length === 0) {
        weakWordsContainer.innerHTML = '<p style="text-align: center; color: #777; margin-top: 20px;">現在、正答率の低い問題はありません。素晴らしい！</p>';
        return;
    }

    top20WeakProblems.forEach(problem => {
        const listItem = document.createElement('li');

        const questionSpan = document.createElement('span');
        questionSpan.className = 'question-text';
        questionSpan.textContent = problem.question;

        const answerContainer = document.createElement('div');
        answerContainer.className = 'answer-container';

        const answerSpan = document.createElement('span');
        answerSpan.className = 'answer-text hidden';
        answerSpan.textContent = problem.answer;

        const showAnswerBtn = document.createElement('button');
        showAnswerBtn.className = 'show-answer-button secondary-button';
        showAnswerBtn.textContent = '答えを見る';

        const accuracyDisplay = document.createElement('span');
        accuracyDisplay.className = 'accuracy-display';
        const percentage = (problem.accuracy * 100).toFixed(1);
        accuracyDisplay.innerHTML = `正答率: <span class="rate">${percentage}%</span> (${problem.correct}/${problem.total})`;

        showAnswerBtn.addEventListener('click', () => {
            answerSpan.classList.remove('hidden');
            showAnswerBtn.classList.add('hidden');
        });

        answerContainer.appendChild(answerSpan);
        answerContainer.appendChild(showAnswerBtn);
        answerContainer.appendChild(accuracyDisplay);

        listItem.appendChild(questionSpan);
        listItem.appendChild(answerContainer);
        weakWordsContainer.appendChild(listItem);
    });
}

function generateShareText() {
    const totalQuestions = correctCount + incorrectCount;
    const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : 0;
    const selectedUnitNumbers = Array.from(document.querySelectorAll('.unit-list input[type="checkbox"]:checked:not([disabled])'))
                                        .map(checkbox => checkbox.value);
    const totalWordsInSelectedRange = wordData.filter(word => selectedUnitNumbers.includes(word.number) && word.enabled === '1').length;
    let rangeText = '';

    if (lastSelectedQuestionCount === 'incorrectOnly') {
        rangeText = '苦手問題';
    } else if (selectedUnitNumbers.length > 0) {
        rangeText = `選択範囲(${totalWordsInSelectedRange}問)`;
    } else {
        const totalAvailableWords = wordData.filter(word => word.enabled === '1').length;
        rangeText = `全範囲(${totalAvailableWords}問)`;
    }

    const shareText = `世界史単語帳で学習しました！\n\n「${rangeText}」の学習結果:\n出題数: ${totalQuestions}問\n正解数: ${correctCount}問\n正答率: ${accuracy}%\n\nあなたも一緒に学習しませんか？`;
    return shareText;
}