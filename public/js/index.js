(function () {

  /**
   * cache DOM
   */

  const $schoolList = $('#school-list');
  const $departmentGroupList = $('#department-group');
  const $resultBody = $('#result-body');
  const $schoolKeyword = $('#school-keyword');

  /**
   * bind event
   */

  // 觸發過濾學校清單
  $schoolKeyword.on('change', () => {
    // 獲取關鍵字用以過濾
    _fliterSchoolList($schoolKeyword.val());
  });

  /**
   * init
   */

  // 所有學校
  let allSchools = [];
  // 動態學校列表
  let schoolList = [];
  // 所有學群
  let departmentGroups = [];

  _init();

  // 擷取學校資料
  function _getSchools() {
    return API.getSchools()
    .then(data => {
      // 留存所有學校列表
      allSchools = data;
    });
  }

  // 擷取學群資料
  function _getDepartmentGroups() {
    return API.getDepartmentGroups()
    .then(data => {
      // 留存學群資料
      departmentGroups = data;
    });
  }

  function _init() {
    // 擷取所有資料並擺放
    Promise.all([_getSchools(), _getDepartmentGroups()]).then(() => {
      // 擺放學校列表
      _setSchoolList(allSchools);
      // 擺放學群列表
      _setDepartmentGroupList(departmentGroups);
    }).catch(error => {
      console.log(error)
    })
  }

  // 過濾學校列表
  function _fliterSchoolList(keyword = '') {
    // 取得以關鍵字過濾中英文名稱的學校列表
    const newSchoolList =  allSchools.filter(school => {
      return school.eng_title.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || school.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    });

    // 重新擺放學校列表
    _setSchoolList(newSchoolList);
  }

  // 設定學校列表下拉選單
  function _setSchoolList(newSchoolList = []) {
    // 同步學校列表
    schoolList = newSchoolList;

    // 重置選單內容
    $schoolList.html(`
      <option selected>請選擇學校 Select School PLZ</option>
      <option>所有學校 All Schools</option>
    `);

    // 擺放學校列表
    for (school of schoolList) {
      $schoolList.append(`<option>${school.title} ${school.eng_title}</option>`);
    }
  }

  // 設定學群列表下拉選單
  function _setDepartmentGroupList(newDepartmentGtoups = []) {
    // 同步學校清單
    departmentGroups = newDepartmentGtoups;

    // 重置選單內容
    $departmentGroupList.html(`
      <option selected>所有學群 All xuequn</option>
    `);

    // 擺放學校列表
    for (group of departmentGroups) {
      $departmentGroupList.append(`<option>${group.title} ${group.eng_title}</option>`);
    }
  }

})();
