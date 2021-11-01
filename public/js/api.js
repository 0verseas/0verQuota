const API = (function () {
  const baseUrl = env.baseUrl;

  function getSchools() {
    const request = fetch(`${baseUrl}/schools`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  function getDepartments(schoolId = 'all', systemId = 'all', departmentGroupId = 'all', keyword = '', includeFirstCategory = true, includeSecondCategory = true, includeThirdCategory = true, showMyanmarProject = false, showEnglishTaughtClass = false, showSchoolFiveGraduate = false) {
    // 整理類組成 array（有才加進去）
    let category = [];

    if (includeFirstCategory) {
      category.push(1);
    }

    if (includeSecondCategory) {
      category.push(2);
    }

    if (includeThirdCategory) {
      category.push(3);
    }
    const request = fetch(`${baseUrl}/schools/${schoolId}/systems/${systemId}/departments?discipline=${departmentGroupId}&category=${category.toString()}&myanmar=${showMyanmarProject}&eng-taught=${showEnglishTaughtClass}&school5=${showSchoolFiveGraduate}&keyword=${keyword}`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  function getDepartmentDetail(schoolId, systemId, departmentId) {
    const request = fetch(`${baseUrl}/schools/${schoolId}/systems/${systemId}/departments/${departmentId}`, {
      credentials: 'include'
    });

    return _requestHandle(request).then(response => {
      if (!response.ok) {
        return response;
      }

      // 取得學制欄位名稱
      let systemPropertyName = 'departments';
      if ((systemId === 'master') || (systemId === 'phd')) {
        systemPropertyName = 'graduate_departments';
      } else if (systemId === 'twoYear') {
        systemPropertyName = 'two_year_tech_departments';
      }

      // 暫存拉到的資料
      const data = response.data;
      // 整理資料
      const newData = {
        school: data,
        system: data.systems[0],
        department: data[systemPropertyName][0]
      }

      delete newData.school.systems;
      delete newData.school.departments;

      response.data = newData;

      return response;
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
    return request.then(fetchResponse => {
      return fetchResponse.json().then(data => {
        return {
          ok: fetchResponse.ok,
          data,
          statusCode: fetchResponse.status
        };
      }).then(response => {
        // 錯誤時的處理

        // 沒錯閃邊去
        if (response.ok) {
          return response;
        }

        // 設定兩種錯誤類型（單行 string 跟原始 string array）
        response.singleErrorMessage = response.data.messages.join(',');
        response.errorMessages = response.data.messages;

        return response;
      });
    })
  }

  return {
    getSchools,
    getDepartments,
    getDepartmentDetail,
    getDepartmentGroups,
  }
})();
