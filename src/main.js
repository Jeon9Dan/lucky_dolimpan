// 메뉴 데이터: { name: 문자열, count: 숫자, color: 문자열 }
let menus = [];
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
const resultBox = document.getElementById("resultBox");
// 제목 입력은 유지하되, 캔버스에는 표시하지 않음
// const wheelTitleInput = document.getElementById("wheelTitleInput");

let currentAngle = 0;       // 현재 회전 각도 (라디안)
let rotationSpeed = 0;      // 회전 속도 (라디안/ms)
let isSpinning = false;     // 돌림판 회전 여부
let decelerating = false;   // 감속 상태 여부
let decelerationStartTime = null;
const decelerationDuration = 12500; // 12초 감속
let rotationSpeedInitial = 0.05;    // 초기 회전 속도

// 메뉴 추가 함수
function addMenu() {
    const nameInput = document.getElementById("menuName");
    const countInput = document.getElementById("menuCount");
    const name = nameInput.value.trim();
    const count = parseInt(countInput.value);
    if(name === "" || isNaN(count) || count < 1) return;
    // 랜덤 색상 생성 (채도와 밝기 고정)
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`;
    menus.push({ name, count, color });
    nameInput.value = "";
    countInput.value = "1";
    updateMenuList();
    drawWheel();
}

// 메뉴 리스트 업데이트 (순서번호와 당첨 확률 표시)
function updateMenuList() {
    const menuList = document.getElementById("menuList");
    menuList.innerHTML = "";
    const total = menus.reduce((acc, cur) => acc + cur.count, 0);
    menus.forEach((menu, index) => {
        const li = document.createElement("li");
        let chance = total > 0 ? ((menu.count / total) * 100).toFixed(0) + "%" : "0%";
        li.innerHTML = `
          <span style="color:${menu.color}; font-weight:bold;">
            ${index+1}.
          </span> 
          ${menu.name} x${menu.count} 
          ${chance} 
        `;

        // 개수 증가 버튼
        const incButton = document.createElement("button");
        incButton.textContent = "▲";
        incButton.addEventListener("click", function() {
            menu.count++;
            updateMenuList();
            drawWheel();
        });
        li.appendChild(incButton);

        // 개수 감소 버튼 (감소 후 0이면 제거)
        const decButton = document.createElement("button");
        decButton.textContent = "▼";
        decButton.addEventListener("click", function() {
            menu.count--;
            if(menu.count < 1) {
                menus.splice(index, 1);
            }
            updateMenuList();
            drawWheel();
        });
        li.appendChild(decButton);

        // 전체삭제 버튼
        const delButton = document.createElement("button");
        delButton.textContent = "전체삭제";
        delButton.addEventListener("click", function() {
            menus.splice(index, 1);
            updateMenuList();
            drawWheel();
        });
        li.appendChild(delButton);

        menuList.appendChild(li);
    });
}

// 원판 그리기 함수
function drawWheel() {
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    if(menus.length === 0) {
        // 메뉴가 없을 때: 빈 원판과 안내 텍스트
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#eee";
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = "black";
        ctx.stroke();

        ctx.font = "24px 'Arial', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.fillText("메뉴가 없습니다", centerX, centerY);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeText("메뉴가 없습니다", centerX, centerY);

        drawPointer(centerX, centerY, radius);
        return;
    }

    // 전체 메뉴 개수 합산 후 섹터 그리기
    const total = menus.reduce((acc, cur) => acc + cur.count, 0);
    let startAngle = currentAngle;
    menus.forEach(menu => {
        const angle = (menu.count / total) * 2 * Math.PI;
        const endAngle = startAngle + angle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = menu.color;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();

        // 섹터 중앙에 메뉴 이름 (폰트 크기 48px, 흰색 채우기 + 두꺼운 검정 외곽선)
        const textAngle = startAngle + angle / 2;
        const textRadius = radius * 0.65;
        const textX = centerX + textRadius * Math.cos(textAngle);
        const textY = centerY + textRadius * Math.sin(textAngle);
        ctx.font = "700 36px 'Black Han Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.fillText(menu.name, textX, textY);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeText(menu.name, textX, textY);

        startAngle = endAngle;
    });

    // 돌림판 원형 외곽선
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "black";
    ctx.stroke();

    drawPointer(centerX, centerY, radius);
}

// 삼각형 포인터 (12시 방향)
function drawPointer(centerX, centerY, radius) {
    ctx.beginPath();
    const pointerHeight = 30;
    const pointerWidth = 40;
    const margin = -20;
    const tipX = centerX;
    const tipY = centerY - radius - margin;
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - pointerWidth/2, tipY - pointerHeight);
    ctx.lineTo(tipX + pointerWidth/2, tipY - pointerHeight);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
}

// 포인터와 만나는 섹터를 결과 박스에 표시
function updateResult() {
    if(menus.length === 0) {
        resultBox.textContent = "당첨 메뉴: 없음";
        return;
    }
    const pointerAngle = 3 * Math.PI / 2;
    let adjustedAngle = (2 * Math.PI - currentAngle + pointerAngle) % (2 * Math.PI);
    const total = menus.reduce((acc, cur) => acc + cur.count, 0);
    let angleSum = 0;
    for(let menu of menus) {
        const angle = (menu.count / total) * 2 * Math.PI;
        angleSum += angle;
        if(adjustedAngle <= angleSum) {
            resultBox.textContent = "당첨 메뉴: " + menu.name;
            break;
        }
    }
}

// 애니메이션 루프
let lastTime = null;
function animate(timestamp) {
    if(!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    if(isSpinning) {
        if(decelerating) {
            if(!decelerationStartTime) decelerationStartTime = timestamp;
            const elapsed = timestamp - decelerationStartTime;
            const elapsedSeconds = elapsed / 1000; // 초 단위로 변환
            const b = 0.24; // 점성 마찰 계수 (필요에 따라 조정)
            const factor = Math.exp(-b * elapsedSeconds); // 또는 Math.exp(-b * t * decelerationDuration)
            rotationSpeed = rotationSpeedInitial * factor;
            if(elapsed >= decelerationDuration) {
                isSpinning = false;
                decelerating = false;
                decelerationStartTime = null;
                spinButton.textContent = "시작";
            }
        }
        currentAngle += rotationSpeed * deltaTime;
        currentAngle %= 2 * Math.PI;
    }
    drawWheel();
    updateResult();
    requestAnimationFrame(animate);
}

spinButton.addEventListener("click", function() {
    if(!isSpinning) {
        if(menus.length === 0) return;
        isSpinning = true;
        decelerating = false;
        rotationSpeed = rotationSpeedInitial;
        spinButton.textContent = "멈추기";
    } else if(isSpinning && !decelerating) {
        decelerating = true;
    }
});

document.getElementById("addMenuButton").addEventListener("click", addMenu);

drawWheel();
requestAnimationFrame(animate);