// WheelModel.js - 돌림판의 데이터와 비즈니스 로직을 관리

class WheelModel {
  constructor() {
    // 메뉴 데이터: { name: 문자열, count: 숫자, color: 문자열 }
    this.menus = [];
    
    // 돌림판 회전 관련 상태
    this.currentAngle = 0;       // 현재 회전 각도 (라디안)
    this.rotationSpeed = 0;      // 회전 속도 (라디안/ms)
    this.isSpinning = false;     // 돌림판 회전 여부
    this.decelerating = false;   // 감속 상태 여부
    this.decelerationStartTime = null;
    this.decelerationDuration = 12500; // 12초 감속
    this.rotationSpeedInitial = 0.05;  // 초기 회전 속도
    
    // 이벤트 콜백 함수들
    this.callbacks = {
      onMenusChanged: [],
      onResultChanged: [],
      onSpinningStateChanged: []
    };
  }

  // ===== 이벤트 관련 메서드 =====
  
  // 이벤트 구독 메서드
  on(eventName, callback) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].push(callback);
    }
    return this;
  }
  
  // 이벤트 발생 메서드
  trigger(eventName, data) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName].forEach(callback => callback(data));
    }
  }
  
  // ===== 메뉴 관리 메서드 =====
  
  // 메뉴 추가
  addMenu(name, count) {
    if (!name || name.trim() === "" || isNaN(count) || count < 1) return false;
    
    // 랜덤 색상 생성 (채도와 밝기 고정)
    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 70%)`;
    this.menus.push({ name, count, color });
    
    // 메뉴 변경 이벤트 발생
    this.trigger('onMenusChanged', this.menus);
    return true;
  }
  
  // 메뉴 개수 증가
  increaseMenuCount(index) {
    if (index < 0 || index >= this.menus.length) return false;
    
    this.menus[index].count++;
    this.trigger('onMenusChanged', this.menus);
    return true;
  }
  
  // 메뉴 개수 감소
  decreaseMenuCount(index) {
    if (index < 0 || index >= this.menus.length) return false;
    
    this.menus[index].count--;
    if (this.menus[index].count < 1) {
      this.removeMenu(index);
    } else {
      this.trigger('onMenusChanged', this.menus);
    }
    return true;
  }
  
  // 메뉴 삭제
  removeMenu(index) {
    if (index < 0 || index >= this.menus.length) return false;
    
    this.menus.splice(index, 1);
    this.trigger('onMenusChanged', this.menus);
    return true;
  }
  
  // 전체 메뉴 개수 합산
  getTotalMenuCount() {
    return this.menus.reduce((acc, cur) => acc + cur.count, 0);
  }
  
  // 메뉴 목록 가져오기
  getMenus() {
    return [...this.menus]; // 복사본 반환
  }
  
  // ===== 돌림판 회전 관련 메서드 =====
  
  // 돌림판 회전 시작
  startSpin() {
    if (this.menus.length === 0 || this.isSpinning) return false;
    
    this.isSpinning = true;
    this.decelerating = false;
    this.rotationSpeed = this.rotationSpeedInitial;
    this.decelerationStartTime = null;
    
    this.trigger('onSpinningStateChanged', { isSpinning: true, decelerating: false });
    return true;
  }
  
  // 돌림판 감속 시작
  startDeceleration() {
    if (!this.isSpinning || this.decelerating) return false;
    
    this.decelerating = true;
    this.decelerationStartTime = null; // 실제 시간은 update에서 설정
    
    this.trigger('onSpinningStateChanged', { isSpinning: true, decelerating: true });
    return true;
  }
  
  // 돌림판 상태 업데이트 (애니메이션 프레임마다 호출)
  update(timestamp) {
    if (!this.isSpinning) return false;
    
    // 감속 처리
    if (this.decelerating) {
      if (!this.decelerationStartTime) {
        this.decelerationStartTime = timestamp;
      }
      
      const elapsed = timestamp - this.decelerationStartTime;
      const elapsedSeconds = elapsed / 1000; // 초 단위로 변환
      const b = 0.24; // 점성 마찰 계수
      const factor = Math.exp(-b * elapsedSeconds);
      this.rotationSpeed = this.rotationSpeedInitial * factor;
      
      // 감속 완료 체크
      if (elapsed >= this.decelerationDuration) {
        this.isSpinning = false;
        this.decelerating = false;
        this.decelerationStartTime = null;
        
        this.trigger('onSpinningStateChanged', { isSpinning: false, decelerating: false });
      }
    }
    
    // 각도 업데이트
    this.currentAngle += this.rotationSpeed * (timestamp - (this._lastTimestamp || timestamp));
    this.currentAngle %= (2 * Math.PI);
    this._lastTimestamp = timestamp;
    
    // 결과 업데이트
    this.updateResult();
    
    return true;
  }
  
  // 현재 각도 가져오기
  getCurrentAngle() {
    return this.currentAngle;
  }
  
  // 회전 상태 가져오기
  getSpinningState() {
    return {
      isSpinning: this.isSpinning,
      decelerating: this.decelerating
    };
  }
  
  // 현재 포인터가 가리키는 메뉴 결정
  updateResult() {
    if (this.menus.length === 0) {
      this.trigger('onResultChanged', null);
      return;
    }
    
    const pointerAngle = 3 * Math.PI / 2; // 12시 방향
    let adjustedAngle = (2 * Math.PI - this.currentAngle + pointerAngle) % (2 * Math.PI);
    const total = this.getTotalMenuCount();
    
    let angleSum = 0;
    for (let menu of this.menus) {
      const angle = (menu.count / total) * 2 * Math.PI;
      angleSum += angle;
      if (adjustedAngle <= angleSum) {
        this.trigger('onResultChanged', menu);
        break;
      }
    }
  }
}

export default WheelModel;
