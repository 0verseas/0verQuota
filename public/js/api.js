const API = (function () {
  const baseUrl = env.baseUrl;

  function getSchools(systemId='') {
    const request = fetch(`${baseUrl}/schools?system_id=${systemId}`, {
      credentials: 'include'
    });

    return _requestHandle(request);
  }

  function getDepartments(schoolId = 'all', systemId = 'all', departmentGroupId = 'all', keyword = '', includeFirstCategory = true, includeSecondCategory = true, includeThirdCategory = true, showMyanmarProject = false, showEnglishTaughtClass = false, showSchoolFiveGraduate = false, isExtendedDepartment = '') {
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
    const request = fetch(`${baseUrl}/schools/${schoolId}/systems/${systemId}/departments?discipline=${departmentGroupId}&category=${category.toString()}&myanmar=${showMyanmarProject}&eng-taught=${showEnglishTaughtClass}&school5=${showSchoolFiveGraduate}&is-extended-department=${isExtendedDepartment}&keyword=${keyword}`, {
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
      } else if (systemId === 'youngAssociate') {
        systemPropertyName = 'young_associate_departments';
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

  async function getDepartmentGroups(systemId='',schoolId='') {
    if (!schoolId) schoolId='';
    const request =  fetch(`${baseUrl}/department-groups?system_id=${systemId}&school_code=${schoolId}`, {
      credentials: 'include'
    });
    try {
      if(systemId=='youngAssociate') {
        let datas = await _requestHandle(request);
        if(!datas.ok) {throw datas};
        let json = datas.data;
        let group_to_values = json.reduce(function (obj, item) {
          obj[item.id + ',' + item.title] = (obj[item.id + ',' + item.title]) || [];
          obj[item.id + ',' + item.title].push({subId: item.subId, subTitle: item.subTitle});
          return obj;
        }, {});
  
        let groups = await Object.keys(group_to_values).map(function (key) {
          key =  key.split(',');
          return {id: key[0], title: key[1], subTitle: group_to_values[key]};
        });
  
        localStorage.groupList = JSON.stringify(groups);
        return groups;
      }

      return _requestHandle(request);

    } catch (e) {
      // console.log('Boooom!!');
      // console.log(e);
    }
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

  function checkKeyword(keyword) {
    return keyword.replace(/[\s]/g, "\u0020").replace(/[^\u3400-\u9fff\u2027\u00b7A-Za-z0-9\u0020\u0027-\u0029.,-（）]/g, "");
  }

  return {
    getSchools,
    getDepartments,
    getDepartmentDetail,
    getDepartmentGroups,
    checkKeyword
  }
})();
