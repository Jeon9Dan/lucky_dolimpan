// MenuView.js - 메뉴 입력 및 목록 UI 관리

class MenuView {
  constructor(model, menuNameId, menuCountId, addMenuBtnId, menuListId) {
    this.model = model;

    // DOM 요소
    this.menuNameInput = document.getElementById(menuNameId);
    this.menuCountInput = document.getElementById(menuCountId);
    this.addMenuButton = document.getElementById(addMenuBtnId);
    this.menuList = document.getElementById(menuListId);

    // 초기화
    this.bindEvents();
  }

  // 이벤트 바인딩
  bindEvents() {
    // 모델 이벤트 구독
    this.model.on('onMenusChanged', () => this.updateMenuList());

    // 메뉴 추가 버튼 클릭 이벤트
    this.addMenuButton.addEventListener('click', () => {
      const name = this.menuNameInput.value.trim();
      const count = parseInt(this.menuCountInput.value);

      if (this.model.addMenu(name, count)) {
        // 성공적으로 추가되면 입력 필드 초기화
        this.menuNameInput.value = "";
        this.menuCountInput.value = "1";
      }
    });
  }

  // 메뉴 목록 UI 업데이트
  updateMenuList() {
    this.menuList.innerHTML = "";
    const menus = this.model.getMenus();
    const total = this.model.getTotalMenuCount();

    menus.forEach((menu, index) => {
      const li = document.createElement("li");
      const chance = (total > 0)
                     ? ((menu.count / total) * 100).toFixed(0) + "%"
                     : "0%";

      li.innerHTML = `
        <span style="color:${menu.color}; font-weight:bold;">
          ${index + 1}.
        </span> 
        ${menu.name} x${menu.count} 
        ${chance} 
      `;

      const increaseButton = this.#createIncreaseButton(index);
      const decreaseButton = this.#createDecreaseButton(index);
      const delButton = this.#createDeleteAllButton(index);

      li.appendChild(increaseButton);
      li.appendChild(decreaseButton);
      li.appendChild(delButton);

      this.menuList.appendChild(li);
    });
  }

  #createIncreaseButton(index) {
    const incButton = document.createElement("button");
    incButton.textContent = "▲";
    incButton.addEventListener("click", () => {
      this.model.increaseMenuCount(index);
    });
    return incButton;
  }

  #createDecreaseButton(index) {
    const decButton = document.createElement("button");
    decButton.textContent = "▼";
    decButton.addEventListener("click", () => {
      this.model.decreaseMenuCount(index);
    });
    return decButton;
  }

  #createDeleteAllButton(index) {
    const delButton = document.createElement("button");
    delButton.textContent = "전체삭제";
    delButton.addEventListener("click", () => {
      this.model.removeMenu(index);
    });
    return delButton;
  }
}

export default MenuView;
