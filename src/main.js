// 모듈 불러오기
import WheelModel from './models/WheelModel.js';
import WheelView from './views/WheelView.js';
import MenuView from './views/MenuView.js';

// 앱 초기화 함수
function initApp() {
    // 모델 생성
    const wheelModel = new WheelModel();

    // 뷰 생성
    const wheelView = new WheelView(
      wheelModel,
      'wheel',         // 캔버스 ID
      'spinButton',    // 시작/멈추기 버튼 ID
      'resultBox'      // 결과 표시 박스 ID
    );

    const menuView = new MenuView(
      wheelModel,
      'menuName',      // 메뉴 이름 입력 ID
      'menuCount',     // 메뉴 개수 입력 ID
      'addMenuButton', // 메뉴 추가 버튼 ID
      'menuList'       // 메뉴 목록 컨테이너 ID
    );

    // 초기 렌더링
    wheelModel.trigger('onMenusChanged');
}

// DOM이 로드된 후 앱 초기화
document.addEventListener('DOMContentLoaded', initApp);