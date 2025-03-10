// WheelView.js - 돌림판 화면 렌더링 및 UI 이벤트 처리

class WheelView {
  constructor(model, canvasId, spinButtonId, resultBoxId) {
    this.model = model;
    
    // DOM 요소
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.spinButton = document.getElementById(spinButtonId);
    this.resultBox = document.getElementById(resultBoxId);
    
    // 초기화
    this.bindEvents();
    this.startAnimationLoop();
  }
  
  // 이벤트 바인딩
  bindEvents() {
    // 모델 이벤트 구독
    this.model.on('onMenusChanged', () => this.drawWheel())
    this.model.on('onResultChanged', (menu) => this.updateResultBox(menu))
    this.model.on('onSpinningStateChanged', (state) => this.updateSpinButton(state));
    
    // 버튼 클릭 이벤트
    this.spinButton.addEventListener('click', () => {
      const { isSpinning, decelerating } = this.model.getSpinningState();
      
      if (!isSpinning) {
        this.model.startSpin();
      } else if (isSpinning && !decelerating) {
        this.model.startDeceleration();
      }
    });
  }
  
  // 결과 표시 업데이트
  updateResultBox(menu) {
    this.resultBox.textContent = menu ? `당첨 메뉴: ${menu.name}` : "당첨 메뉴: 없음";
  }
  
  // 버튼 텍스트 업데이트
  updateSpinButton(state) {
    this.spinButton.textContent = state.isSpinning ? "멈추기" : "시작";
  }
  
  // 애니메이션 루프 시작
  startAnimationLoop() {
    const animate = (timestamp) => {
      this.model.update(timestamp);
      this.drawWheel();
      requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }
  
  // 돌림판 그리기 함수
  drawWheel() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    const menus = this.model.getMenus();
    
    if (menus.length === 0) {
      this.drawEmptyWheel(centerX, centerY, radius);
    } else {
      this.drawMenuSectors(centerX, centerY, radius, menus);
    }
    
    // 외곽선
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.lineWidth = 5;
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
    
    this.drawPointer(centerX, centerY, radius);
  }
  
  // 빈 돌림판 그리기
  drawEmptyWheel(centerX, centerY, radius) {
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = "#eee";
    this.ctx.fill();
    
    this.ctx.font = "24px 'Arial', sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillStyle = "white";
    this.ctx.fillText("메뉴가 없습니다", centerX, centerY);
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 2;
    this.ctx.strokeText("메뉴가 없습니다", centerX, centerY);
  }
  
  // 메뉴 섹터 그리기
  drawMenuSectors(centerX, centerY, radius, menus) {
    const currentAngle = this.model.getCurrentAngle();
    const total = this.model.getTotalMenuCount();
    
    let startAngle = currentAngle;
    menus.forEach(menu => {
      const angle = (menu.count / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      
      // 섹터 그리기
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = menu.color;
      this.ctx.fill();
      
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = "#fff";
      this.ctx.stroke();
      
      // 텍스트 그리기
      const textAngle = startAngle + angle / 2;
      const textRadius = radius * 0.65;
      const textX = centerX + textRadius * Math.cos(textAngle);
      const textY = centerY + textRadius * Math.sin(textAngle);
      
      this.ctx.font = "700 36px 'Black Han Sans', sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(menu.name, textX, textY);
      this.ctx.strokeStyle = "black";
      this.ctx.lineWidth = 2;
      this.ctx.strokeText(menu.name, textX, textY);
      
      startAngle = endAngle;
    });
  }
  
  // 포인터 그리기
  drawPointer(centerX, centerY, radius) {
    this.ctx.beginPath();
    const pointerHeight = 30;
    const pointerWidth = 40;
    const margin = -20;
    const tipX = centerX;
    const tipY = centerY - radius - margin;
    
    this.ctx.moveTo(tipX, tipY);
    this.ctx.lineTo(tipX - pointerWidth/2, tipY - pointerHeight);
    this.ctx.lineTo(tipX + pointerWidth/2, tipY - pointerHeight);
    this.ctx.closePath();
    this.ctx.fillStyle = "red";
    this.ctx.fill();
  }
}

export default WheelView;
