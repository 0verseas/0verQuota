const app = (function () {

    /**
     * cache DOM
     */

    const $schoolList = $('#school-list');
    const $departmentGroupList = $('#department-group');
    const $resultBody = $('#result-body');
    const $schoolKeyword = $('#school-keyword');
    const $keyword = $('#keyword');

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
    let schools = [];

    _init();

    /**
     * functions
     */

    // 過濾學校列表
    function filterSchoolList(keyword = '') {
      // 取得以關鍵字過濾中英文名稱的學校列表
      const newSchoolList =  allSchools.filter(school => {
        return school.eng_title.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || school.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
      });

      // 重新擺放學校列表
      _setSchoolList(schoolList = newSchoolList);
    }

    // 過濾系所列表
    function filterDepartmentList() {
      // 載入目前選擇的所有學校資料（clone array of object）
      let filterSchools = JSON.parse(JSON.stringify(schools));

      // 擷取過濾條件
      const schoolId = $schoolList.val();
      const departmentGroupId = $departmentGroupList.val();
      const keyword = $keyword.val();

      // 準備網址參數
      const paramsStr = jQuery.param({
        school: schoolId,
        group: departmentGroupId,
        keyword
      });
      // 準備新網址
      const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${paramsStr}`;
      // 更新網址
      window.history.replaceState({path: newurl}, '', newurl);

      // 過濾每間學校資料
      for (let school of filterSchools) {
        // 取得以符合過濾條件的系所列表
        school.graduate_departments = school.graduate_departments.filter(department => {
          // 學群條件（主要、次要學群其一）
          if ((departmentGroupId !== 'all') && (department.main_group != departmentGroupId) && (department.sub_group != departmentGroupId)) {
            return false;
          }
          // 系所名稱中英文關鍵字過濾
          return department.eng_title.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || department.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
        });
      }

      // 重新擺放系所列表
      _setDepartmentList(filterSchools);
    }

    // 一選擇學校就拉該學校資料
    function selectSchool(schoolId = 'all') {
      API.getDepartments(schoolId, 'master').then(data => {
        // 留存學校資料
        schools = data;
        // 過濾系所列表
        filterDepartmentList();
      }).catch(error => {
        // 清空系所列表
        _setDepartmentList();
        console.error(error);
      });
    }

    // 擷取學校資料
    function _getSchools() {
      return API.getSchools().then(data => {
        // 留存所有學校列表
        allSchools = data;
      });
    }

    // 擷取學群資料
    function _getDepartmentGroups() {
      return API.getDepartmentGroups().then(data => {
        // 留存學群資料
        departmentGroups = data;
      });
    }

    function _init() {
      // 擷取網址參數
      const params = new URLSearchParams(document.location.search.substring(1));
      const schoolId = params.get('school');
      const groupId = params.get('group');
      const keyword = params.get('keyword');

      // 擷取所有資料並擺放
      Promise.all([_getSchools(), _getDepartmentGroups()]).then(() => {
        // 擺放學校列表
        _setSchoolList(schoolList = allSchools);
        // 擺放學群列表
        _setDepartmentGroupList(departmentGroups);

        // 同步過濾參數
        $schoolList.children(`[value=${schoolId}]`).prop('selected', true);
        $departmentGroupList.children(`[value=${groupId}]`).prop('selected', true);
        $keyword.prop('value', keyword);

        // 若參數有，則預選擇學校
        if (schoolId) {
          selectSchool(schoolId);
        }

      }).catch(error => {
        console.log(error)
      });
    }

    // 設定學校列表下拉選單
    function _setSchoolList(newSchoolList = []) {
      // 重置選單內容
      $schoolList.html(`
        <option value="" disabled selected>請選擇學校 Select School PLZ</option>
        <option value="all">所有學校 All Schools</option>
      `);

      // 擺放學校列表
      for (let school of newSchoolList) {
        $schoolList.append(`<option value="${school.id}">${school.title} ${school.eng_title}</option>`);
      }
    }

    // 設定學群列表下拉選單
    function _setDepartmentGroupList(newDepartmentGtoups = []) {
      // 重置選單內容
      $departmentGroupList.html(`
        <option value="all" selected>所有學群 All xuequn</option>
      `);

      // 擺放學群列表
      for (let group of departmentGroups) {
        $departmentGroupList.append(`<option value="${group.id}">${group.title} ${group.eng_title}</option>`);
      }
    }

    // 設定系所列表
    function _setDepartmentList(schoolData = []) {
      // 重置系所表格
      $resultBody.html(``);

      // 擺放系所列表
      // 無資料則顯示提示
      if (schoolData.length === 0) {
        $resultBody.append(`
          <tr><td colspan=7>無符合條件的系所</td></tr>
        `);
      } else {
        // 擺放各系所資料
        for (let school of schoolData) {
          for (let department of school.graduate_departments) {
            // 設定簡便連結
            const schoolURL = `master-detail.html?id=${department.id}&school-id=${school.id}&tab=nav-schoolInfo`;
            const detailURL = `master-detail.html?id=${department.id}&school-id=${school.id}&tab=nav-deptInfo'`;
            const shenchaItemURL = `master-detail.html?id=${department.id}&school-id=${school.id}&tab=nav-shenchaItem`;

            // 擺放各系所資料
            $resultBody.append(`
              <tr>
                <td>
                  <a href="${schoolURL}" target="_blank">
                    <span class="td-br">${school.title}</span>
                    <span class="td-br">${school.eng_title}</span>
                  </a>
                </td>

                <td>
                  <a href="${detailURL}" target="_blank">
                    <span class="td-br">${department.title}</span>
                    <span claｚss="td-br">${department.eng_title}</span>
                  </a>
                </td>

                <td>
                  <a href="${shenchaItemURL}" target="_blank">
                    <span class="td-br">審查項目</span>
                    <span class="td-br">ShenCha Item</span>
                  </a>
                </td>

                <td>${department.admission_selection_quota}</td>
                <td>${department.self_enrollment_quota}</td>
              </tr>
            `);
          }
        }
      }
    }

    return {
      filterSchoolList,
      selectSchool,
      filterDepartmentList
    }

  })();
