(function () {

  /**
   * cache DOM
   */

  const $schoolList = $('#school-list');
  const $departmentGroup = $('#department-group');
  const $resultBody = $('#result-body');
  const $schoolKeyword = $('#school-keyword');

  /**
   * init
   */

  let allSchoolList = [];
  let schoolList = [];
  _getSchoolList();

  /**
   * bind event
   */

  $schoolKeyword.on('change', _fliterSchoolList);

  // 擷取學校列表
  function _getSchoolList() {
    API.getSchoolsList()
    .then(function(res) {
      if(res.ok) {
        return res.json();
      } else {
        throw res
      }
    }).then(function(data) {
      // 留存所有學校列表
      allSchoolList = data;
      // 擺放學校列表
      _setSchoolList(data);

      return data.info_status
    }).catch(function(err) {
      err.json && err.json().then((data) => {
        console.error(data);
      });
    })
  }

  // 過濾學校清單
  function _fliterSchoolList() {
    // 獲取關鍵字
    keyword = $schoolKeyword.val();

    //
    const newSchoolList =  allSchoolList.filter((school) => {
      return school.eng_title.toLowerCase().indexOf(keyword.toLowerCase()) > -1 || school.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
    });

    _setSchoolList(newSchoolList);
  }

  // 設定學校列表下拉選單
  function _setSchoolList(newSchoolList = []) {
    // 同步學校清單
    schoolList = newSchoolList;

    // 重置選單內容
    $schoolList.html(`
      <option selected>請選擇學校 Select School PLZ</option>
      <option>所有學校 All Schools</option>
    `);

    // 擺放學校列表
    schoolList.forEach(function(school) {
      $schoolList.append(`<option>${school.title} ${school.eng_title}</option>`);
    }, this);
  }

  })();
