loading.start();

const app = (function () {

  /**
   * cache DOM
   */

  const $schoolList = $('#school-list');
  const $departmentGroupList = $('#department-group');
  const $resultBody = $('#result-body');
  const $schoolKeyword = $('#school-keyword');
  const $keyword = $('#keyword');
  const $isGroup1 = $('#isGroup1');
  const $isGroup2 = $('#isGroup2');
  const $isGroup3 = $('#isGroup3');

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
    systemId = 'bachelor',
    keyword = '',
    departmentGroupId = 'all',
    includeFirstCategory = true,
    includeSecondCategory = true,
    includeThirdCategory = true
  ) {
    loading.start();

    // 準備網址參數
    const paramsStr = jQuery.param({
      school: schoolId,
      group: departmentGroupId,
      keyword,
      'first-group': includeFirstCategory,
      'second-group': includeSecondCategory,
      'third-group': includeThirdCategory,
    });

    // 準備新網址
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${paramsStr}`;

    // 更新網址
    window.history.replaceState({path: newurl}, null, newurl);

    // 過濾系所
    API.getDepartments(schoolId, systemId, departmentGroupId, keyword, includeFirstCategory, includeSecondCategory, includeThirdCategory).then(response => {
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
        return school.departments.length > 0;
      });

      // 重新擺放系所列表
      let allDepartments = [];

      // 打平資料結構（學校層包進去系所層）
      for (let school of filteredSchools) {
        let schoolName = school.title;
        let engSchoolName = school.eng_title;
        for (let department of school.departments) {
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
  function _getDepartmentGroups() {
    return API.getDepartmentGroups().then(response => {
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
    const departmentGroupId = params.get('group') && params.get('group').length !== 0 ? params.get('group') : 'all';
    const keyword = params.get('keyword') ? params.get('keyword') : '';
    const includeFirstCategory = params.has('first-group') ? JSON.parse(params.get('first-group')) : true;
    const includeSecondCategory = params.has('second-group') ? JSON.parse(params.get('second-group')) : true;
    const includeThirdCategory = params.has('third-group') ? JSON.parse(params.get('third-group')) : true;

    // 擷取所有資料並擺放
    Promise.all([_getSchools(), _getDepartmentGroups()]).then(([schools, departmentGroups]) => {
      // 擺放學校列表
      _setSchoolList(allSchools = schools);

      // 擺放學群列表
      _setDepartmentGroupList(departmentGroups);

      // 同步過濾參數
      $schoolList.children(`[value=${schoolId}]`).prop('selected', true);
      $departmentGroupList.children(`[value=${departmentGroupId}]`).prop('selected', true);
      $keyword.prop('value', keyword);
      $isGroup1.prop('checked', includeFirstCategory);
      $isGroup2.prop('checked', includeSecondCategory);
      $isGroup3.prop('checked', includeThirdCategory);

      // 有設定學校 ID，就直接拉資料
      if (schoolId) {
        filterDepartmentList(
          schoolId, 'bachelor', keyword, departmentGroupId,
          includeFirstCategory, includeSecondCategory, includeThirdCategory
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
  function _setDepartmentGroupList(departmentGroups = []) {
    // 重置選單內容
    $departmentGroupList.html(`
      <option value="all" selected>所有學群 All disciplines</option>
    `);

    // 擺放學群列表
    for (let group of departmentGroups) {
      $departmentGroupList.append(`<option value="${group.id}">${group.title} ${group.eng_title}</option>`);
    }
  }

  // 設定系所列表
  function _setDepartmentList(departments = null) {

    let html = '';

    // 若是無資料，則顯示提示
    if (departments === null ){
      // 無資料，直接挑出
      html += `<tr><td colspan=12>請選擇過濾條件</td></tr>`;
      return html;
    }

    // 擺放系所列表
    // 擺放各系所資料
    for (let department of departments) {
      // 設定簡便連結
      const schoolURL = `bachelor-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-schoolInfo`;
      const detailURL = `bachelor-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-deptInfo`;
      const shenchaItemURL = `bachelor-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-shenchaItem`;

      // 設定個人申請名額
      // 名額為零則不顯示
      let admissionSelectionQuota = `
        <td colspan="2">
          <span class="td-br">僅限聯合分發</span>
          <span class="td-br">Distributed allocation only</span>
        </td>
      `;
      // 有名額要連審查項目一起顯示
      if (department.admission_selection_ratify_quota > 0) {
        admissionSelectionQuota = `
        <td>${department.admission_selection_ratify_quota}</td>
        <td>
          <a href="${shenchaItemURL}" target="_blank">
            <span class="td-br">審查項目</span>
            <span class="td-br">Application documents</span>
          </a>
        </td>
        `;
      }

      // 設定聯合分發名額
      // 名額為零則不顯示
      let admissionPlacementQuota = `
        <td colspan="6">
          <span class="td-br">僅限個人申請</span>
          <span class="td-br">Individual application only</span>
        </td>
      `;

      if (department.admission_placement_ratify_quota > 0) {
        admissionPlacementQuota = `<td>${department.admission_placement_ratify_quota}</td>`;

        // 設定聯合分發各梯次名額
        // 有分梯次則填入各梯次名額
        if (department.admission_placement_step_quota !== null) {
          admissionPlacementQuota += `
            <td>${department.admission_placement_step_quota.s1}</td>
            <td>${department.admission_placement_step_quota.s2}</td>
            <td>${department.admission_placement_step_quota.s3}</td>
            <td>${department.admission_placement_step_quota.s4}</td>
            <td>${department.admission_placement_step_quota.s5}</td>
          `;
        } else {
          admissionPlacementQuota += `
            <td colspan="5">
              <span class="td-br">各梯次皆可選填至名額用完為止</span>
              <span class="td-br">Quota can be selected as long as available (applies to all tiers)</span>
            </td>
          `;
        }
      }

      // 設定類組
      let groupHtml = '';
      switch(department.group_code) {
        case '1':
          groupHtml = `
            <span class="td-br">第一類組<span>
            <span class="td-br">First Group</span>
          `;
          break;
        case '2':
          groupHtml = `
          <span class="td-br">第二類組<span>
          <span class="td-br">Second Group</span>
          `;
          break;
        case '3':
          groupHtml = `
          <span class="td-br">第三類組<span>
          <span class="td-br">Third Group</span>
          `;
          break;
        default:
          break;
      }

      // 擺放各系所資料
      html += `
        <tr>
          <td>${department.card_code}</td>

          <td>
            <a href="${schoolURL}" target="_blank">
              <span class="td-br">${department.school}</span>
              <span class="td-br">${department.eng_school}</span>
            </a>
          </td>
          `;
      if(department.ioh == null)
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
      else
        html += `
            <td>
              <a href="${detailURL}" target="_blank">
                <span >
                  ${department.title}
                </span>
              </a>
              <a href="${department.ioh.url}" target="_blank">
                <img src="https://storage.googleapis.com/ioh-assets/uploads/production/static/default/ioh_dept.png" width="40" />
              </a>
              <a href="${detailURL}" target="_blank">
                <span class="td-br">${department.eng_title}</span>
              </a>
            </td>
            `;

      html += `
          <td>${groupHtml}</td>

          ${admissionSelectionQuota}

          ${admissionPlacementQuota}
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
