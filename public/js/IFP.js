loading.start();

const app = (function () {

  /**
   * cache DOM
   */

  const $schoolList = $('#school-list');
  const $departmentGroupList = $('#department-group');
  const $resultBody = $('#result-body');
  const $keyword = $('#keyword');
  const $isGroup1 = $('#isGroup1');
  const $isGroup2 = $('#isGroup2');
  const $isGroup3 = $('#isGroup3');
  const $showEnglishTaught = $('#showEnglishTaught');
  const $showSchoolFive = $('#showSchoolFive');

  /**
   * bind event
   */

  /**
   * init
   */

  // 所有學校
  let allSchools = [];

  $('.container').find('*[data-toggle=tooltip]').tooltip();

  _init();

  /**
   * functions
   */
  $schoolList.on('change', _reRenderGroup);

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
    systemId = 'IFP',
    keyword = '',
    departmentGroupId = 'all',
    includeFirstCategory = true,
    includeSecondCategory = true,
    includeThirdCategory = true,
    showEnglishTaughtClass = false,
    showSchoolFiveGraduate = false,
  ) {
    loading.start();

    const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
    keyword = converter(keyword);
    // 準備網址參數
    const paramsStr = jQuery.param({
      school: schoolId,
      group: departmentGroupId,
      keyword,
      'first-group': includeFirstCategory,
      'second-group': includeSecondCategory,
      'third-group': includeThirdCategory,
      'eng-taught': showEnglishTaughtClass,
      'school5': showSchoolFiveGraduate
    });

    // 準備新網址
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${paramsStr}`;

    // 更新網址
    window.history.replaceState({path: newurl}, null, newurl);

    // 過濾系所
    API.getDepartments(schoolId, systemId, departmentGroupId, keyword, includeFirstCategory, includeSecondCategory, includeThirdCategory, showEnglishTaughtClass, showSchoolFiveGraduate, '2').then(response => {
      if (!response.ok) {
        switch (response.statusCode) {
          case 404:
            $resultBody.html(`<tr><td colspan=16>無符合條件的系所</td></tr>`);
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
        return school.departments.length > 0;
      });

      // 重新擺放系所列表
      let allDepartments = [];

      // 打平資料結構（學校層包進去系所層）
      for (let school of filteredSchools) {
        let schoolName = school.title;
        let engSchoolName = school.eng_title;
        let allowSchoolFive = school.has_five_year_student_allowed;
        for (let department of school.departments) {
          department.school = schoolName;
          department.eng_school = engSchoolName;
          department.allow_school_five = allowSchoolFive;
          allDepartments.push(department);
        }
      }

      // 有資料放資料，無資料放提示
      if (allDepartments.length > 0) {
        // 重置系所表格
        $resultBody.html('');

      } else {
        $resultBody.html(`<tr><td colspan=16>無符合條件的系所</td></tr>`);
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

  // 更改學校時僅顯示該校有的學群
  function _reRenderGroup() {
    let currentGroupId = $departmentGroupList.find(':selected').val();
    _getDepartmentGroups().then((departmentGroups) => {
      _setDepartmentGroupList(departmentGroups);
      // 檢查新選的學校是否有之前選的學群
      if ($departmentGroupList.find("option[value="+ currentGroupId +"]").text().trim() != '') {
        $departmentGroupList.children(`[value=${currentGroupId}]`).prop('selected', true);
      }
      // bootstrap需要刷新才會顯示新選項
      $departmentGroupList.selectpicker('refresh');
    });
  }

  // 擷取學校資料
  function _getSchools() {
    return API.getSchools('IFP').then(response => {
      if (!response.ok) {
        throw(new Error(`${response.statusCode} (${response.singleErrorMessage})`));
      }
      return response.data;
    });
  }

  // 擷取學群資料
  function _getDepartmentGroups(school_code = $schoolList.find(':selected').val()) {
    return API.getDepartmentGroups('IFP', school_code).then(response => {
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
    const showEnglishTaughtClass = params.has('eng-taught')? JSON.parse(params.get('eng-taught')): false;
    const showSchoolFiveGraduate = params.has('school5')? JSON.parse(params.get('school5')): false;

    // 擷取所有資料並擺放
    Promise.all([_getSchools(), _getDepartmentGroups(schoolId)]).then(([schools, departmentGroups]) => {
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
      $showEnglishTaught.prop('checked', showEnglishTaughtClass);
      $showSchoolFive.prop('checked', showSchoolFiveGraduate);

      $schoolList.selectpicker('refresh');
      $departmentGroupList.selectpicker('refresh');

      // 有設定學校 ID，就直接拉資料
      if (schoolId) {
        filterDepartmentList(
          schoolId, 'IFP', keyword, departmentGroupId,
          includeFirstCategory, includeSecondCategory, includeThirdCategory,
          showEnglishTaughtClass, showSchoolFiveGraduate,
        );
      } else {
        loading.complete();
      }
    }).catch(error => {
      // console.log(error);
      swal({title: `Error`, text: error, type:"error", confirmButtonText: '確定', allowOutsideClick: false});
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
      const schoolURL = `IFP-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-schoolInfo`;
      const detailURL = `IFP-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-deptInfo`;
      const shenchaItemURL = `IFP-detail.html?id=${department.id}&school-id=${department.school_code}&tab=nav-shenchaItem`;

      // 設定個人申請名額
      // 名額為零則不顯示
      // 無個人申請名額則餘額留用顯示-
      let admissionSelectionQuota = `
        <td colspan="2">
          <span class="td-br">無名額</span>
          <span class="td-br">United Distribution only</span>
        </td>
        <td> - </td>
        <td> - </td>
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

      //中五制學生
      let schoolFiveHtml;
      if(department.allow_school_five){
        schoolFiveHtml= `
              <td>
                  <span class="td-br">是</span>
                  <span class="td-br">Yes</span>
              </td> `;
      } else {
        schoolFiveHtml= `
              <td>
                  <span class="td-br">否</span>
                  <span class="td-br">Not</span>
              </td> `;
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
          <td>
      `;

      html += `
            <span class="badge table-primary"> 國際專修部 </span>
            <br />
            <a href="${detailURL}" target="_blank">
              <span >
                國際專修部（${department.title}）
              </span>
              <span class="td-br">
                ${(department.eng_title)? 'International Foundation Program<br/>（'+ department.eng_title +'）':''}
              </span>
            <a/>
      `;
      if (department.ioh != null)
      {
        html += `
            <a href="${department.ioh.url}" target="_blank">
              <img src="https://api.overseas.ncnu.edu.tw/img/IOH_logo.png" width="80" />
            </a>
        `;
      }

      html += `
          </td>
          <td>${groupHtml}</td>
          ${admissionSelectionQuota}
          ${engTaughtHtml}
          ${schoolFiveHtml}
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
