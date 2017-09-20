const API = (function () {
  const baseUrl = env.baseUrl;

  function getSchools() {
    const request = fetch(`${baseUrl}/schools`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  function getDepartments(schoolId = 'all', systemId = 'all') {
    const request = fetch(`${baseUrl}/schools/${schoolId}/systems/${systemId}/departments`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  function getDepartmentDetail(departmentId) {
    const request =  fetch(`${baseUrl}/departments/${departmentId}`, {
      credentials: 'include'
    });

    return _requestHandle(request);
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
        return response.json().then((data) => {
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
