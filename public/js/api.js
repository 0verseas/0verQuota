const API = (function () {
  const baseUrl = env.baseUrl;

  function getSchoolsList() {
    return fetch(`${baseUrl}/schools`, {
      credentials: 'include'
    });
  }

  function getDepartmentsList(schoolId = 'all', systemId = 'all') {
    return fetch(`${baseUrl}/schools/${schoolId}/systems/${systemId}/departments`, {
      credentials: 'include'
    });
  }

  function getDepartmentDetail(departmentId) {
    return fetch(`${baseUrl}/departments/${departmentId}`, {
      credentials: 'include'
    });
  }

  function getDepartmentGroups() {
    return fetch(`${baseUrl}/department-groups`, {
      credentials: 'include'
    });
  }

  return {
    getSchoolsList,
    getDepartmentsList,
    getDepartmentDetail,
    getDepartmentGroups,
  }
})();
