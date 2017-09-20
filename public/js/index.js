const app = (function () {

  /**
   * cache DOM
   */

  const $schoolList = $('#school-list');
  const $departmentGroupList = $('#department-group');
  const $resultBody = $('#result-body');
  const $schoolKeyword = $('#school-keyword');

  /**
   * init
   */

  // 所有學校
  let allSchools = [];
  // 動態學校列表
  let schoolList = [];
  // 所有學群
  let departmentGroups = [];
  // 所選學校資料
  let school = {};

  _init();

  /**
   * functions
   */

  // 過濾學校列表
  function fliterSchoolList(keyword = '') {
    // 取得以關鍵字過濾中英文名稱的學校列表
    const newSchoolList =  allSchools.filter(school => {
      return school.eng_title.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || school.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    });

    // 重新擺放學校列表
    _setSchoolList(newSchoolList);
  }

  function selectSchool(schoolId = 'all') {
    API.getDepartments(schoolId, 'bachelor').then(data => {
      _setDepartmentList(data);
    }).catch(error => {
      _setDepartmentList();
      console.error(error);
    });
  }

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
    });
  }

  // 設定學校列表下拉選單
  function _setSchoolList(newSchoolList = []) {
    // 同步學校列表
    schoolList = newSchoolList;

    // 重置選單內容
    $schoolList.html(`
      <option value="" disabled selected>請選擇學校 Select School PLZ</option>
      <option value="all">所有學校 All Schools</option>
    `);

    // 擺放學校列表
    for (let school of schoolList) {
      $schoolList.append(`<option value="${school.id}">${school.title} ${school.eng_title}</option>`);
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
    for (let group of departmentGroups) {
      $departmentGroupList.append(`<option>${group.title} ${group.eng_title}</option>`);
    }
  }

  // 設定系所列表
  function _setDepartmentList(schoolData = []) {
    // 同步學校資料
    school = schoolData;

    // 重置系所表格
    $resultBody.html(``);

    // 擺放系所列表
    // 無資料則顯示提示
    if (school.length === 0) {
      $resultBody.append(`
        <tr><td colspan=12>無符合條件的系所</td></tr>
      `);
    } else {
      // 擺放各系所資料
      for (let department of school.departments) {
        $resultBody.append(`
          <tr>
            <td>${department.card_code}</td>
            <td><span class="td-br">${school.title}</span><span class="td-br">${school.eng_title}</span></td>
            <td><span class="td-br">${department.title}</span><span class="td-br">${department.eng_title}</span></td>
            <td>${department.group_code}</td>
            <td><span class="td-br">${department.main_group_data.title}</span><span class="td-br">${department.main_group_data.eng_title}</span></td>
            <td>${department.admission_selection_quota}</td>
            <td>${department.admission_placement_quota}</td>
            <td><img src="https://yuer.tw/sunnyworm.png" style="height:auto; width:20px;"></td>
            <td><img src="https://yuer.tw/sunnyworm.png" style="height:auto; width:20px;"></td>
            <td><img src="https://yuer.tw/sunnyworm.png" style="height:auto; width:20px;"></td>
            <td><img src="https://yuer.tw/sunnyworm.png" style="height:auto; width:20px;"></td>
            <td><img src="https://yuer.tw/sunnyworm.png" style="height:auto; width:20px;"></td>
          </tr>
        `);
      }
    }
  }

  return {
    fliterSchoolList,
    selectSchool
  }

})();
