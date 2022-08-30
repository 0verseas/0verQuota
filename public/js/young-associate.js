loading.start();

const app = (function () {

  /**
   * cache DOM
   */

  const $schoolList = $('#school-list');
  const $departmentMainGroupList = $('#main-group');
  const $departmentSubGroupList = $('#sub-group');
  const $resultBody = $('#result-body');
  const $keyword = $('#keyword');

  /**
   * init
   */

  // 所有學校
  let allSchools = [];
  let _groupList = [];

  _init();

  /**
   * functions
   */
  $departmentMainGroupList.on('change', _reRenderGroup);
  $schoolList.on('change', _reRenderMainGroup);

  function _init() {
    // 擷取網址參數
    const params = new URLSearchParams(document.location.search.substring(1));
    const schoolId = params.get('school') && params.get('school').length !== 0 ? params.get('school') : null;
    const departmentGroupId = params.get('group') ? params.get('group') : 'all, all';
    const keyword = params.get('keyword') ? params.get('keyword') : '';
    // 擷取所有資料並擺放
    Promise.all([_getSchools(), _getDepartmentGroups(schoolId)]).then(([schools, departmentGroups]) => {
      // 擺放學校列表
      _setSchoolList(allSchools = schools);
      // 擺放學群列表
      _setDepartmentGroupList(_groupList = departmentGroups);

      // 同步過濾參數
      $schoolList.children(`[value=${schoolId}]`).prop('selected', true);
      const depGroupId = departmentGroupId.split(',');
      $departmentMainGroupList.children(`[value=${depGroupId[0]}]`).prop('selected', true);
      _reRenderGroup();
      $departmentSubGroupList.children(`[value=${depGroupId[1]}]`).prop('selected', true);

      $keyword.prop('value', keyword);

      $schoolList.selectpicker();
      $departmentMainGroupList.selectpicker('refresh');
      $departmentSubGroupList.selectpicker('refresh');

      // 有設定學校 ID，就直接拉資料
      if (schoolId) {
        filterDepartmentList(
          schoolId, 'youngAssociate', keyword, depGroupId[0], depGroupId[1]
        );
      } else {
        loading.complete();
      }
    }).catch(error => {
      // console.log(error)
      swal({title: `Error`, text: error, type:"error", confirmButtonText: '確定', allowOutsideClick: false});
    });
  }

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
    departmentSubGroupId = 'all',
  ) {
    loading.start();

    keyword = API.checkKeyword(keyword);
    $keyword.val(keyword);

    let departmentGroupId = departmentMainGroupId + ',' + departmentSubGroupId;
    // 準備網址參數
    const paramsStr = jQuery.param({
      school: schoolId,
      group: departmentGroupId,
      keyword: keyword,
    });
    // 準備新網址
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${paramsStr}`;
    // 更新網址
    window.history.replaceState({path: newurl}, '', newurl);

    // 過濾系所
    API.getDepartments(schoolId, systemId, departmentGroupId, keyword, true, true, true, false, false, false).then(response => {
      if (!response.ok) {
        switch (response.statusCode) {
          case 404:
            $resultBody.html(`<tr><td colspan=12>無符合條件的系所</td></tr>`);
            break;
          default:
            swal({title: `Error`, text: response.singleErrorMessage, type:"error", confirmButtonText: '確定', allowOutsideClick: false});
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
      // console.log(error);
      loading.complete();
    });
  }

  // 擷取學校資料
  function _getSchools() {
    return API.getSchools("youngAssociate").then(response => {
      if (!response.ok) {
        throw(new Error(`${response.statusCode} (${response.singleErrorMessage})`));
      }
      return response.data;
    });
  }

  // 擷取學群資料
  function _getDepartmentGroups(school_code=$schoolList.find(':selected').val()) {
    return API.getDepartmentGroups('youngAssociate', school_code).then(response => {
      return response;
    });
  }

  // 更改學校時僅顯示該校有的學群
  function _reRenderMainGroup() {
    let currentGroupId = $departmentMainGroupList.find(':selected').val();
    _getDepartmentGroups().then((departmentGroups) => {
      _setDepartmentGroupList(departmentGroups);
      // 檢查新選的學校是否有之前選的學群
      if ($departmentMainGroupList.find("option[value="+ currentGroupId +"]").text().trim() != '') {
        $departmentMainGroupList.children(`[value=${currentGroupId}]`).prop('selected', true);
      }
      // bootstrap需要刷新才會顯示新選項
      $departmentMainGroupList.selectpicker('refresh');
      _reRenderGroup();
    });
  }

  // 更改主學群時變更副學群選項
  function _reRenderGroup() {
    const groupIndex = $departmentMainGroupList.find(':selected').data('id');
    let currentGroupId = $departmentSubGroupList.find(':selected').val();
    $departmentSubGroupList.html(`
      <option value="all" selected>所有副學群</option>
    `);
    if (groupIndex !== -1) {
      _groupList[groupIndex]['subTitle'].forEach((obj, index) => {
        $departmentSubGroupList.append(`<option value="${obj.subId}">${obj.subTitle}</option>`);
      });
    }
    // 檢查新選的主學群是否包含之前選的副學群
    if ($departmentSubGroupList.find(`option[value=${currentGroupId}]`).text().trim() != '') {
      $departmentSubGroupList.children(`[value=${currentGroupId}]`).prop('selected', true);
    }
    // bootstrap需要刷新才會顯示新選項
    $departmentSubGroupList.selectpicker('refresh');
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
    $departmentMainGroupList.html(`
      <option value="all" data-id="-1" selected>所有主學群</option>
    `);
    // 擺放學群列表
    departmentGroups.forEach((obj, index) => {
      $departmentMainGroupList.append(`<option value="${obj.id}" data-id="${index}">${obj.title}</option>`);
    })
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
      const shenchaItemURL = `young-associate-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-shenchaItem`;

      // 擺放各系所資料
      html += `
        <tr>
          <td>
            <span class="td-br">${department.card_code}</span>
          </td>
          <td>
            <a href="${schoolURL}" target="_blank">
              <span class="td-br">${department.school}</span>
              <span class="td-br">${department.eng_school}</span>
            </a>
          </td>
          <td>
            <a href="${detailURL}" target="_blank">
              <span >
                ${department.title}
              </span>
              <span class="td-br">${department.eng_title}</span>
              <a/>
          </td>
          <td>${department.admission_selection_ratify_quota}</td>

          <td>
            <a href="${shenchaItemURL}" target="_blank">
              <span class="td-br">檢核項目</span>
              <span class="td-br">Application documents</span>
            </a>
          </td>
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
