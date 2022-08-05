loading.start();

const app = (function () {

  /**
   * cache DOM
   */

  const $schoolList = $('#school-list');
  const $departmentMainGroupList = $('#department-main-group');
  const $departmentSubGroupList = $('#department-sub-group');
  const $resultBody = $('#result-body');
  const $keyword = $('#keyword');

  /**
   * init
   */

  // 所有學校
  let allSchools = [];

  _init();

  /**
   * functions
   */

  // 過濾學校列表
  function filterSchoolList(keyword = '') {
    // 重置網址參數
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    // 更新網址
    window.history.replaceState({path: newurl}, null, newurl);

    

    // 取得以關鍵字過濾中英文名稱的學校列表
    const newSchoolList =  allSchools.filter(school => {
      return school.eng_title.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || school.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    });

    // 重新擺放學校列表
    _setSchoolList(newSchoolList);
  }

  // 過濾系所列表
  function filterDepartmentList(
    schoolId = 'all',
    systemId = 'youngAssociate',
    keyword = '',
    departmentMainGroupId = 'all',
    departmentSubGroupId = 'all'
  ) {
    loading.start();

    // 準備網址參數
    const paramsStr = jQuery.param({
      school: schoolId,
      main_group: departmentMainGroupId,
      sub_group: departmentSubGroupId,
      keyword
    });
    // 準備新網址
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${paramsStr}`;
    // 更新網址
    window.history.replaceState({path: newurl}, '', newurl);

    // 過濾系所
    API.getYoungAssociateDepartments(schoolId, systemId, departmentMainGroupId, departmentSubGroupId, keyword).then(response => {
      if (!response.ok) {
        switch (response.statusCode) {
          case 404:
            $resultBody.html(`<tr><td colspan=12>無符合條件的系所</td></tr>`);
            break;
          default:
            alert(response.singleErrorMessage);
            break;
        }

        loading.complete();

        return;
      }

      // 取得過濾過的列表，並剔除無任何系所者
      const filteredSchools = response.data.filter(school => {
        return school.young_associate_departments.length > 0;
      });

      // 重新擺放系所列表
      let allDepartments = [];

      // 打平資料結構（學校層包進去系所層）
      for (let school of filteredSchools) {
        let schoolName = school.title;
        let engSchoolName = school.eng_title;
        for (let department of school.young_associate_departments) {
          department.school = schoolName;
          department.eng_school = engSchoolName;
          allDepartments.push(department);
        }
      }

      // 有資料放資料，無資料放提示
      if (allDepartments.length > 0) {
        // 重置系所表格
        $resultBody.html('');
      } else {
        $resultBody.html(`<tr><td colspan=12>無符合條件的系所</td></tr>`);
      }

      // 設定分頁、置放資料
      $('#pagination-container').pagination({
        dataSource: allDepartments,
        pageRange: 2,
        showGoInput: true,
        showGoButton: true,
        formatGoInput: '<%= input %>',
        callback: (data, pagination) => {
          _setDepartmentList(data);
        }
      });

      loading.complete();
    }).catch(error => {
      console.log(error);
      loading.complete();
    });
  }

  // 擷取學校資料
  function _getSchools() {
    return API.getSchools().then(response => {
      if (!response.ok) {
        throw(new Error(`${response.statusCode} (${response.singleErrorMessage})`));
      }

      return response.data;
    });
  }

  // 擷取學群資料
  function _getDepartmentMainGroups() {
    return API.getDepartmentMainGroups().then(response => {
      if (!response.ok) {
        throw(new Error(`${response.statusCode} (${response.singleErrorMessage})`));
      }

      return response.data;
    });
  }

  function _getDepartmentSubGroups() {
    return API.getDepartmentSubGroups().then(response => {
      if (!response.ok) {
        throw(new Error(`${response.statusCode} (${response.singleErrorMessage})`));
      }

      return response.data;
    });
  }

  function _init() {
    // 擷取網址參數
    const params = new URLSearchParams(document.location.search.substring(1));
    const schoolId = params.get('school') && params.get('school').length !== 0 ? params.get('school') : null;
    const departmentMainGroupId = params.get('main_group') && params.get('main_group').length !== 0 ? params.get('main_group') : 'all';
    const departmentSubGroupId = params.get('sub_group') && params.get('sub_group').length !== 0 ? params.get('sub_group') : 'all';
    const keyword = params.get('keyword') ? params.get('keyword') : '';

    // 擷取所有資料並擺放
    Promise.all([_getSchools(), _getDepartmentMainGroups(), _getDepartmentSubGroups()]).then(([schools, departmentMainGroups, departmentSubGroups]) => {
      // 擺放學校列表
      _setSchoolList(allSchools = schools);
      // 擺放學群列表
      _setDepartmentMainGroupList(departmentMainGroups);

      _setDepartmentSubGroupList(departmentSubGroups);

      // 同步過濾參數
      $schoolList.children(`[value=${schoolId}]`).prop('selected', true);
      $departmentMainGroupList.children(`[value=${departmentMainGroupId}]`).prop('selected', true);
      $departmentSubGroupList.children(`[value=${departmentSubGroupId}]`).prop('selected', true);
      $keyword.prop('value', keyword);

      $schoolList.selectpicker();
      $departmentMainGroupList.selectpicker();
      $departmentSubGroupList.selectpicker();

      // 有設定學校 ID，就直接拉資料
      if (schoolId) {
        filterDepartmentList(
          schoolId, 'youngAssociate', keyword, departmentMainGroupId, departmentSubGroupId
        );
      } else {
        loading.complete();
      }
    }).catch(error => {
      console.log(error)
      alert(error);
    });
  }

  // 設定學校列表下拉選單
  function _setSchoolList(newSchoolList = []) {
    // 重置選單內容
    $schoolList.html(`
      <option value="all" selected>所有學校 All Schools</option>
    `);

    // 擺放學校列表
    for (let school of newSchoolList) {
      $schoolList.append(`<option value="${school.id}">${school.title} ${school.eng_title}</option>`);
    }

    // 若過濾結果為只有一個，直接幫使用者選定該校
    if (newSchoolList.length === 1) {
      // 提取該校 id
      const schoolId = newSchoolList[0].id;
      // 幫使用者選定
      $schoolList.children(`[value=${schoolId}]`).prop('selected', true);
    }
  }

  // 設定學群列表下拉選單
  function _setDepartmentMainGroupList(departmentMainGroups = []) {
    // 重置選單內容
    $departmentMainGroupList.html(`
      <option value="all" selected>主類科 All main disciplines</option>
    `);

    // 擺放學群列表
    for (let group of departmentMainGroups) {
      $departmentMainGroupList.append(`<option value="${group.id}">${group.title} ${group.eng_title}</option>`);
    }
  }

  function _setDepartmentSubGroupList(departmentSubGroups = []) {
    // 重置選單內容
    $departmentSubGroupList.html(`
      <option value="all" selected>副類科 All sub disciplines</option>
    `);

    // 擺放學群列表
    for (let group of departmentSubGroups) {
      $departmentSubGroupList.append(`<option value="${group.id}">${group.title} ${group.eng_title}</option>`);
    }
  }

  // 設定系所列表
  function _setDepartmentList(departments = null) {

    let html = '';

    // 若是無資料，則顯示提示
    if (departments === null) {
      // 無資料，直接挑出
      html += `<tr><td colspan=12>請選擇過濾條件</td></tr>`;
      return html;
    }

    // 擺放系所列表
    // 擺放各系所資料
    for (let department of departments) {
      // 設定簡便連結
      const schoolURL = `young-associate-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-schoolInfo`;
      const detailURL = `young-associate-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-deptInfo`;

      //全英語授課
      let engTaughtHtml;
      if(department.has_eng_taught){
        engTaughtHtml= `
              <td>
                  <span class="td-br">是</span>
                  <span class="td-br">Yes</span>
              </td> `;
      } else {
        engTaughtHtml= `
              <td>
                  <span class="td-br">否</span>
                  <span class="td-br">Not</span>
              </td> `;
      }

      // 擺放各系所資料
      html += `
        <tr>
          <td>
            <a href="${schoolURL}" target="_blank">
              <span class="td-br">${department.school}</span>
              <span class="td-br">${department.eng_school}</span>
            </a>
          </td>
          `;

      if(department.ioh == null && department.collego == null) {
        html += `
          <td>
            <a href="${detailURL}" target="_blank">
              <span >
                ${department.title}
              </span>
              <span class="td-br">${department.eng_title}</span>
              <a/>
          </td>
          `;
      }else {
        iohHtml = ``;
        collegoHtml = ``;
        if (department.ioh != null) {
          iohHtml = `
            <a href="${department.ioh.url}" target="_blank">
              <img src="https://api.overseas.ncnu.edu.tw/img/IOH_logo.png" width="80" />
            </a>
          `;
        }
          
        if (department.collego != null) {
          collegoHtml = `
            <a href="${department.collego.url}" target="_blank">
              <img src="https://collego.edu.tw/Content/img/Collego_C-450.png" width="80" />
            </a>
          `;
        }
          
        html += `
          <td>
            <a href="${detailURL}" target="_blank">
              <span >
                ${department.title}
              </span>
            </a>
            ${iohHtml}
            <a href="${detailURL}" target="_blank">
              <span class="td-br">${department.eng_title}</span>
            </a>
            ${collegoHtml}
          </td>
          `;
      }

      html += `
          <td>${department.admission_selection_ratify_quota}</td>

          

          ${engTaughtHtml}
        </tr>
      `;
    }

    // 暫存去除 hash 的網址
    const url = window.location.href;
    // 前往 #result
    window.location.href = "#result";
    // 改變網址
    window.history.replaceState(null, null, url);

    // 擺上結果
    $resultBody.html(html);
  }

  return {
    filterSchoolList,
    filterDepartmentList
  }

})();
