
/**
*	cache DOM
*/

const $expositionList = $('#exposition-list');
const $filterInput = $('#filter'); // 篩選欄
const $filterBtn = $('#filter-btn'); // 篩選按鈕
const $filterResetBtn = $('#filter-reset-btn'); // 篩選重置按鈕
const $searchInput = $('#search'); // 搜尋欄
const $searchBtn = $('#search-btn'); // 搜尋按鈕
const $searchResetBtn = $('#search-reset-btn'); // 搜尋重置按鈕
const $subTitle = $('.sub-title');

const $titleArray = ['永平','巴生','吉隆坡','雙溪大年','亞庇','美里'];
let stage = 1;
let isInit = false; // 避免有人都重置了還一直按

/**
*	init
*/

_init();

/**
*	bind event
*/

$searchBtn.on('click', _getExpositionListWithKeyword); // 列表搜尋按鈕事件

$filterBtn.on('click', _filterInput); // 列表篩選按鈕事件

// 偵測是否在搜尋輸入欄按下 enter
$searchInput.on('keydown', (e)=>{
    if(e.key === 'Enter'){
        e.preventDefault(); // 阻止換行
        _getExpositionListWithKeyword();
    }
})

// 偵測是否在篩選輸入欄按下 enter
$filterInput.on('keydown', (e)=>{
    if(e.key === 'Enter'){
        e.preventDefault(); // 阻止換行
        _filterInput();
    }
})

$searchResetBtn.on('click', _handleSearchReset); // reset 搜尋結果

$filterResetBtn.on('click', _handleFileterReset); // reset 篩選結果

async function _init() {
    loading.start();
    const params = new URLSearchParams(document.location.search.substring(1));
    stage = params.get('stage') && params.get('stage').length !== 0 ? params.get('stage') : 1;
    $subTitle.text($titleArray[stage-1]);
    try {
        const response = await _getExpositionList();
        if (!response.ok) { throw response; }
        const schoolDatas = await response.json();

        let html = '';
        let htmlArray = [];
        let count = 0;
        for (let schooldata of schoolDatas) {
            if(+schooldata[0]<10){
                schooldata[0] = '0'+schooldata[0];
            }
            htmlArray[count] = `
                <tr>
                    <td style="text-align: center; vertical-align:middle;">
                        ${schooldata[0]}
                    </td>
                    <td style="text-align: center; vertical-align:middle;">
                        ${schooldata[1]}
                        <br/>
                        ${schooldata[2]}
                    </td>
                    <td style="text-align: center; vertical-align:middle;">
                        -
                    </td>
                </tr>
            `;
            count++;
        }

        for(let htmlLine of htmlArray) {
            html += htmlLine;
        }
        await $expositionList.html(html);
        isInit = true;
        await loading.complete();
    } catch (e) {
        console.error(e);
        await e.json && e.json().then((data) => {
            swal({title: `ERROR`, text: data.messages[0], type:"error", confirmButtonText: '確定', allowOutsideClick: false});
        })
        await loading.complete();
    }
    return;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function _filterInput(){
    let value = $filterInput.val().toLowerCase();
    const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
    value = converter(value);

    $expositionList.find('tr').filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });

    return;
}


function _getExpositionList() {
    return fetch(`${env.baseUrl}/malaysia-exposition/${stage}/school-list`, {
        credentials: 'include'
    });
}

async function _getExpositionListWithKeyword() {
    let keyword = $searchInput.val().toLowerCase();
    const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
    keyword = converter(keyword);

    loading.start();
    try {
        const response = await fetch(`${env.baseUrl}/malaysia-exposition/${stage}/school-list/${keyword}`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        if (!response.ok) { throw response; }
        const schoolDatas = await response.json();

        let html = '';
        let htmlArray = [];
        let count = 0;
        if(schoolDatas.length > 0) {
            for (let schooldata of schoolDatas) {
                if(!schooldata[3]){
                    schooldata[3] = '';
                }
                if(+schooldata[0]<10){
                    schooldata[0] = '0'+schooldata[0];
                }
                htmlArray[count] = `
                    <tr>
                        <td style="text-align: center; vertical-align:middle;">
                            ${schooldata[0]}
                        </td>
                        <td style="text-align: center; vertical-align:middle;">
                            ${schooldata[1]}
                            <br/>
                            ${schooldata[2]}
                        </td>
                        <td style="text-align: center; vertical-align:middle;">
                            ${schooldata[3]}
                        </td>
                    </tr>
                `;
                count++;
            }
            for(let htmlLine of htmlArray) {
                html += htmlLine;
            }
        } else {
            html = '<tr><td colspan=16>無符合關鍵字的系所</td></tr>';
        }
        await $expositionList.html(html);
        isInit = false;
        await loading.complete();
    } catch (e) {
        console.error(e);
        await e.json && e.json().then((data) => {
            swal({title: `ERROR`, text: data.messages[0], type:"error", confirmButtonText: '確定', allowOutsideClick: false});
        })
        await loading.complete();
    }

    return;
}

function _handleFileterReset (){
    $filterInput.val('');
    value = '';

    $expositionList.find('tr').filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });

    return;
}

function _handleSearchReset(){
    if(isInit){
        return;
    }
    $searchInput.val('');
    _init();
    return;
}