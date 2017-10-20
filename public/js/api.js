const API = (function () {
  const baseUrl = env.baseUrl;

  function getSchools() {
    const request = fetch(`${baseUrl}/schools`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  function getDepartments(schoolId = 'all', systemId = 'all') {
    const request = fetch(`${baseUrl}/schools/${schoolId}/systems/${systemId}/departments?discipline=all&category=1,2,3`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  function getDepartmentDetail(system, schoolId, departmentId) {
    const request =  fetch(`${baseUrl}/schools/${schoolId}/systems/${system}/departments/${departmentId}`, {
      credentials: 'include'
    });

    return _requestHandle(request).then(data => {
      // 取得學制欄位名稱
      let systemPropertyName = 'departments';
      if ((system === 'master') || (system === 'phd')) {
        systemPropertyName = 'graduate_departments';
      } else if (system === 'two-year') {
        systemPropertyName = 'two_year_tech_departments';
      }

      // 整理資料
      const newData = {
        school: data,
        system: data.systems[0],
        department: data[systemPropertyName][0]
      }

      delete newData.school.systems;
      delete newData.school.departments;

      return newData;
    });
  }

  function getDepartmentGroups() {
    const request =  fetch(`${baseUrl}/department-groups`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  // http request 的中介處理
  function _requestHandle(request) {
    return request.then(response => {
      // 結果 ok 就回傳 body
      if (response.ok) {
        return response.json();
      } else {
        // 結果不 ok 就回傳 error
        return response.json().then(data => {
          // 每個錯誤訊息都仍一個 error
          for (message of data.messages) {
            throw(new Error(`${response.status} (${message})`));
          }
        });
      }
    })
  }

  return {
    getSchools,
    getDepartments,
    getDepartmentDetail,
    getDepartmentGroups,
  }
})();
