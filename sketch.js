let spriteSheetRun;     // 角色一: 奔跑/行走圖片 (N1/ALL1.png)
let spriteSheetJump;    // 角色一: 跳躍圖片 (N1/ALL2.png)
let spriteSheetNew;     // 角色二原始圖片 (N1/ALL23.png)
let spriteSheetChar2Transform; // 角色二變身圖片 (N1/ALL21.png)
let spriteSheetChar3;   // 角色三原始圖片 (N1/ALL31.png)
let spriteSheetChar3Transform; // 角色三變身圖片 (N1/ALL32.png)

// --- 常數定義 ---
// ALL1 參數 (角色一: 行走)
const RUN_SHEET_WIDTH = 373;
const RUN_FRAME_HEIGHT = 94;
const RUN_FRAME_COUNT = 7;
const RUN_FRAME_WIDTH = RUN_SHEET_WIDTH / RUN_FRAME_COUNT; 

// ALL2 參數 (角色一: 跳躍)
const JUMP_SHEET_WIDTH = 223;
const JUMP_FRAME_HEIGHT = 96; 
const JUMP_FRAME_COUNT = 4;
const JUMP_FRAME_WIDTH = JUMP_SHEET_WIDTH / JUMP_FRAME_COUNT; 

// 角色二原始參數 (ALL23.png)
const NEW_SHEET_WIDTH = 1059;
const NEW_FRAME_HEIGHT = 91;
const NEW_FRAME_COUNT = 14;
const NEW_FRAME_WIDTH = NEW_SHEET_WIDTH / NEW_FRAME_COUNT; 

// 角色二變身參數 (N1/ALL21.png)
const CHAR2_TRANSFORM_WIDTH = 450;
const CHAR2_TRANSFORM_HEIGHT = 84;
const CHAR2_TRANSFORM_COUNT = 7; 
const CHAR2_TRANSFORM_FRAME_WIDTH = CHAR2_TRANSFORM_WIDTH / CHAR2_TRANSFORM_COUNT;

// 角色三原始參數 (N1/ALL31.png)
const CHAR3_ANIMATION_WIDTH = 340; 
const CHAR3_FRAME_HEIGHT = 138;
const CHAR3_FRAME_COUNT = 5; 
const CHAR3_FRAME_WIDTH = CHAR3_ANIMATION_WIDTH / CHAR3_FRAME_COUNT;

// 角色三變身參數 (N1/ALL32.png)
const CHAR3_TRANSFORM_WIDTH = 315;
const CHAR3_TRANSFORM_HEIGHT = 138;
const CHAR3_TRANSFORM_COUNT = 5; 
const CHAR3_TRANSFORM_FRAME_WIDTH = CHAR3_TRANSFORM_WIDTH / CHAR3_TRANSFORM_COUNT;

// 放大所有角色 20% (1.2 * 1.2 = 1.44)
const SCALE_FACTOR = 1.44; 
const PROXIMITY_DISTANCE = 200; 
const MOVE_SPEED = 6; 
const JUMP_HEIGHT = 80;


// --- 遊戲/角色狀態變數 ---
let characterX, characterY, groundY;
let newCharacterFrame = 0; 
let char2TransformFrame = 0; 
let char3Frame = 0; 
let transformFrame = 0;
let char3IsTransformed = false; 
let char2IsProximity = false; 
let NEW_CHAR_FIXED_X, NEW_CHAR_FIXED_Y, CHAR3_FIXED_X;         
let currentFrame = 0; 
let isMoving = false; 
let isJumping = false; 
let direction = 1; 
let jumpStep = 0;
let inputField; 

// 測驗邏輯相關變數
let quizData; 
let currentQuestion; 
let correctAnswer; 
let char2Message = "需要我解答嗎?"; 
let char2Feedback = ""; 
let feedbackTimer = 0; 
// ⭐ 調整回饋顯示時間，加快文字跳出速度
const FEEDBACK_DURATION = 45; 

// 計分和題數
let questionCount = 0; 
let score = 0;         

// 角色三對話文字
let char3Message = "累了嗎 要不要吃鬆餅"; 

// 遊戲狀態機
const GAME_STATE = {
    INIT: 0,
    QUESTION_PENDING: 1, 
    AWAITING_ANSWER: 2,  
    SHOW_FEEDBACK: 3,    
    IDLE: 4,
    SHOW_SCORE: 5             
};
let gameState = GAME_STATE.IDLE;

// --- 輔助函數：生成新的數學問題 ---
function generateNewQuestion() {
    if (questionCount >= 5) { // 達到五題，進入計分狀態
        gameState = GAME_STATE.SHOW_SCORE;
        // ⭐ 更新計分訊息，顯示滿分
        char2Message = `測驗結束！您的得分是 ${score} 分 (滿分 100 分)。`; 
        inputField.hide();
        return;
    }
    
    // 增加題數
    questionCount++;
    
    let num1 = floor(random(1, 10)); 
    let num2 = floor(random(1, 10)); 

    currentQuestion = `${num1} + ${num2} = ? (第 ${questionCount} 題/共 5 題)`; 
    correctAnswer = num1 + num2;
    char2Message = currentQuestion;
    gameState = GAME_STATE.AWAITING_ANSWER;
}

// --- 輔助函數：處理答案提交 ---
function handleAnswer() {
    if (gameState !== GAME_STATE.AWAITING_ANSWER) return;

    let userAnswer = int(inputField.value());
    inputField.value(''); 

    if (isNaN(userAnswer) || !quizData.getRowCount()) {
        if(quizData.getRowCount() > 0) {
             char2Feedback = quizData.getRow(0).getString('Hint');
        } else {
             char2Feedback = "請輸入數字答案。";
        }
        gameState = GAME_STATE.SHOW_FEEDBACK;
        feedbackTimer = frameCount + FEEDBACK_DURATION;
        return;
    }

    if (userAnswer === correctAnswer) {
        char2Feedback = quizData.getRow(0).getString('Correct_Feedback');
        // ⭐ 答對，增加 20 分 (滿分 100 / 5 題 = 20 分/題)
        score += 20; 
    } else {
        char2Feedback = quizData.getRow(0).getString('Incorrect_Feedback');
    }

    gameState = GAME_STATE.SHOW_FEEDBACK;
    feedbackTimer = frameCount + FEEDBACK_DURATION;
}


// --- Preload: 載入資源 ---
function preload() {
  spriteSheetRun = loadImage('N1/ALL1.png'); 
  spriteSheetJump = loadImage('N1/ALL2.png'); 
  spriteSheetNew = loadImage('N1/ALL23.png'); 
  spriteSheetChar2Transform = loadImage('N1/ALL21.png'); 
  spriteSheetChar3 = loadImage('N1/ALL31.png'); 
  spriteSheetChar3Transform = loadImage('N1/ALL32.png'); 
  
  quizData = loadTable('quiz.csv', 'csv', 'header'); 
}

// --- Setup: 初始化設定 ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(15); 
  
  groundY = height / 2; 
  characterX = width / 2;
  characterY = groundY;
  
  NEW_CHAR_FIXED_X = width / 3; 
  NEW_CHAR_FIXED_Y = height / 2; 
  CHAR3_FIXED_X = width * 2 / 3; 
  
  inputField = createInput('');
  inputField.hide(); 
}

// --- Draw: 每幀繪製 ---
function draw() {
  background('#e2eafc'); 

  if (isJumping) {
    handleJump();
  } else if (isMoving) {
    characterX += MOVE_SPEED * direction; 
    currentFrame = (floor(frameCount / 4) % RUN_FRAME_COUNT); 
  } else {
    currentFrame = 0;
  }
  
  const boundaryOffset = RUN_FRAME_WIDTH * SCALE_FACTOR / 2;
  characterX = constrain(characterX, boundaryOffset, width - boundaryOffset);

  drawCharacter(); 

  // 角色一 vs 角色二 互動/變身/提問邏輯
  const distChar1Char2 = abs(characterX - NEW_CHAR_FIXED_X);

  if (distChar1Char2 < PROXIMITY_DISTANCE) {
      char2IsProximity = true;
      
      if (gameState === GAME_STATE.IDLE) {
          generateNewQuestion();
      }

      char2TransformFrame = (floor(frameCount / 3) % CHAR2_TRANSFORM_COUNT);

      // 輸入框定位 (使用角色一上方舊邏輯, 只有在 AWAITING_ANSWER 狀態下才顯示)
      if (gameState === GAME_STATE.AWAITING_ANSWER) {
          inputField.show();
          inputField.position(characterX - 75, characterY - RUN_FRAME_HEIGHT * SCALE_FACTOR - 30); 
          inputField.size(150);
      } else {
          inputField.hide();
      }

      let displayMessage;
      if (gameState === GAME_STATE.SHOW_FEEDBACK) {
          displayMessage = char2Feedback;
          if (frameCount > feedbackTimer) {
              // 檢查回饋顯示時間是否結束
              if (questionCount < 5) {
                  // 還有下一題，生成新問題
                  generateNewQuestion();
              } else {
                  // 這是最後一題的回饋，進入計分狀態
                  gameState = GAME_STATE.SHOW_SCORE;
                  // ⭐ 更新計分訊息
                  char2Message = `測驗結束！您的得分是 ${score} 分 (滿分 100 分)。`; 
                  inputField.hide(); 
              }
          }
      } else if (gameState === GAME_STATE.AWAITING_ANSWER) {
          displayMessage = currentQuestion;
      } else if (gameState === GAME_STATE.SHOW_SCORE) {
          displayMessage = char2Message;
      } else {
          displayMessage = char2Message;
      }

      drawSpeechBubble(NEW_CHAR_FIXED_X, NEW_CHAR_FIXED_Y, displayMessage, NEW_FRAME_HEIGHT * SCALE_FACTOR);
      
  } else {
      char2IsProximity = false;
      
      newCharacterFrame = (floor(frameCount / 3) % NEW_FRAME_COUNT);
      
      inputField.hide();
      
      if (gameState !== GAME_STATE.IDLE) {
          gameState = GAME_STATE.IDLE;
          char2Message = "需要我解答嗎?";
      }
      
      // 如果離開互動範圍，且已經結束測驗，需要重設以便下次開始
      if (gameState === GAME_STATE.SHOW_SCORE && distChar1Char2 > PROXIMITY_DISTANCE * 1.5) {
           questionCount = 0;
           score = 0;
           gameState = GAME_STATE.IDLE;
           char2Message = "需要我解答嗎?";
      }
  }
  
  drawNewCharacter(); 

  // 角色三變身判斷和動畫幀更新 (已新增對話框邏輯)
  const distance = abs(characterX - CHAR3_FIXED_X);
  
  if (distance < PROXIMITY_DISTANCE) {
      char3IsTransformed = true;
      transformFrame = (floor(frameCount / 3) % CHAR3_TRANSFORM_COUNT);
      
      // 當角色一靠近時，顯示角色三的對話框
      drawSpeechBubble(
          CHAR3_FIXED_X, 
          NEW_CHAR_FIXED_Y, 
          char3Message, 
          CHAR3_FRAME_HEIGHT * SCALE_FACTOR // 使用角色三的基礎高度來定位對話框
      );
      
  } else {
      char3IsTransformed = false;
      char3Frame = (floor(frameCount / 3) % CHAR3_FRAME_COUNT); 
  }
  
  drawCharacterThree();
  
  // 在螢幕左上方繪製指定文字
  drawFixedText("414730704鄭安淳");
}

// --- 繪製文字對話框 (角色二/三使用) ---
function drawSpeechBubble(charX, charY, message, charHeight) {
    push();
    textAlign(CENTER);
    textSize(18);
    
    let padding = 15; 
    
    let txtWidth = textWidth(message);
    let boxWidth = txtWidth + padding * 2;
    let boxHeight = 30 + padding; 

    // 定位在角色上方
    let textY = charY - charHeight / 2 - 30; 
    let textX = charX;

    fill('#FFD9EC'); 
    stroke(0);
    strokeWeight(1);
    rectMode(CENTER);
    
    rect(textX, textY, boxWidth, boxHeight, 8); 

    fill(0);
    noStroke();
    text(message, textX, textY + 5);
    pop();
}

// 獨立的繪製固定文字函數
function drawFixedText(textString) {
    push();
    fill(0); // 黑色文字
    textSize(20);
    textAlign(LEFT, TOP);
    // 定位在畫布的左上角，留一些邊距 (x=10, y=10)
    text(textString, 10, 10);
    pop();
}


// --- 處理跳躍邏輯 (角色一) ---
function handleJump() {
  const maxSteps = JUMP_FRAME_COUNT * 2; 
  const stepDistance = JUMP_HEIGHT / (maxSteps / 2); 
  if (jumpStep >= maxSteps) {
      characterY = groundY; 
      isJumping = false;    
      jumpStep = 0;         
      return;
  }
  if (jumpStep < maxSteps / 2) { 
    characterY -= stepDistance;
  } else { 
    characterY += stepDistance;
  }
  currentFrame = floor(jumpStep / 2) % JUMP_FRAME_COUNT;
  jumpStep++;
}

// --- 繪製角色一 (ALL1.png/ALL2.png) ---
function drawCharacter() {
  push(); 
  translate(characterX, characterY);
  scale(direction, 1); 
  let img, frameW, frameH, sourceX;
  let dWidth, dHeight; 
  if (isJumping) {
    img = spriteSheetJump;
    frameW = JUMP_FRAME_WIDTH;
    frameH = JUMP_FRAME_HEIGHT;
    sourceX = currentFrame * JUMP_FRAME_WIDTH;
  } else {
    img = spriteSheetRun;
    frameW = RUN_FRAME_WIDTH;
    frameH = RUN_FRAME_HEIGHT;
    sourceX = currentFrame * RUN_FRAME_WIDTH;
  }
  dWidth = frameW * SCALE_FACTOR; 
  dHeight = frameH * SCALE_FACTOR; 
  image(img, -dWidth / 2, -dHeight / 2, dWidth, dHeight, sourceX, 0, frameW, frameH);
  pop(); 
}

// --- 繪製角色二 (ALL23.png / 變身 ALL21.png) ---
function drawNewCharacter() {
  push();
  let newCharX = NEW_CHAR_FIXED_X;
  let newCharY = NEW_CHAR_FIXED_Y; 
  
  let img, frameW, frameH, sourceX;
  
  if (char2IsProximity) {
      img = spriteSheetChar2Transform;
      frameW = CHAR2_TRANSFORM_FRAME_WIDTH;
      frameH = CHAR2_TRANSFORM_HEIGHT;
      sourceX = char2TransformFrame * CHAR2_TRANSFORM_FRAME_WIDTH;
  } else {
      img = spriteSheetNew;
      frameW = NEW_FRAME_WIDTH;
      frameH = NEW_FRAME_HEIGHT;
      sourceX = newCharacterFrame * NEW_FRAME_WIDTH;
  }
  
  translate(newCharX, newCharY);
  
  let dWidth = frameW * SCALE_FACTOR; 
  let dHeight = frameH * SCALE_FACTOR; 

  image(img, 
        -dWidth / 2, 
        -dHeight / 2, 
        dWidth, 
        dHeight, 
        sourceX, 
        0, 
        frameW, 
        frameH);
        
  pop();
}

// --- 繪製角色三 (ALL31.png / 變身 ALL32.png) ---
function drawCharacterThree() {
  push();

  let char3X = CHAR3_FIXED_X;
  let char3Y = NEW_CHAR_FIXED_Y; 
  
  let img, frameW, frameH, sourceX;
  let scaleDirection = 1;
  
  if (char3IsTransformed) {
      img = spriteSheetChar3Transform; 
      frameW = CHAR3_TRANSFORM_FRAME_WIDTH;
      frameH = CHAR3_TRANSFORM_HEIGHT;
      sourceX = transformFrame * CHAR3_TRANSFORM_FRAME_WIDTH;
      
      if (characterX > char3X) { 
          scaleDirection = -1;
      } else {
          scaleDirection = 1;
      }
      
  } else {
      img = spriteSheetChar3;
      frameW = CHAR3_FRAME_WIDTH;
      frameH = CHAR3_FRAME_HEIGHT;
      sourceX = char3Frame * CHAR3_FRAME_WIDTH;
      
      if (characterX > char3X) { 
          scaleDirection = -1;
      } else {
          scaleDirection = 1; 
      }
  }
  
  translate(char3X, char3Y);
  scale(scaleDirection, 1); 
  
  let dWidth = frameW * SCALE_FACTOR; 
  let dHeight = frameH * SCALE_FACTOR; 
  
  image(
    img, 
    -dWidth / 2,         
    -dHeight / 2,        
    dWidth,              
    dHeight,             
    sourceX, 
    0,                   
    frameW,   
    frameH
  );

  pop();
}

// --- Key Pressed/Released 邏輯 ---
function keyPressed() {
  if (keyCode === ENTER && char2IsProximity && gameState === GAME_STATE.AWAITING_ANSWER) {
      handleAnswer();
      return false;
  }

  if (!isJumping) {
    if (keyCode === RIGHT_ARROW) {
      isMoving = true;
      direction = 1; 
    } else if (keyCode === LEFT_ARROW) {
      isMoving = true;
      direction = -1; 
    } else if (keyCode === UP_ARROW) { 
      isJumping = true;
      isMoving = false;
    }
  }
}

function keyReleased() {
  if (!isJumping) {
    if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
      if (!keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
          isMoving = false;
      }
    }
  }
}

// --- Window Resized: 調整畫布大小 ---
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  groundY = height / 2; 
  
  NEW_CHAR_FIXED_X = width / 3; 
  NEW_CHAR_FIXED_Y = height / 2; 
  CHAR3_FIXED_X = width * 2 / 3; 
  
  if (!isJumping) {
    characterY = groundY;
  }
}