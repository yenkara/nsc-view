const base_url = 'http://192.168.1.3:8080'
// const base_url = 'http://iidx.in/nsc'
const search_url = 'https://search.shopping.naver.com/search/all?frm=NVSHATC&query='
const search_page = '&pagingSize=40&pagingIndex='
const best100_url = 'https://search.shopping.naver.com/best100v2/detail.nhn?catId='

const keywordSettingP = document.createElement('p')
keywordSettingP.innerHTML = '키워드 관리'
keywordSettingP.className = 'setting'
keywordSettingP.onclick = () => showKeywordSetting()

window.addEventListener('DOMContentLoaded', function() { 
  getList()
});

const getList = keyword => {
  getItemList(keyword)
  getKeywordList(keyword)
}

const getKeywordList = (sel) => {
  const keywordDiv = document.getElementById('keyword')

  keywordDiv.innerHTML = ''
  keywordDiv.appendChild(keywordSettingP)

  fetch(base_url + '/api/v1/list/keyword', {
    method: 'get'
  }).then(resp => {
    const respJson = resp.json()
    return respJson
  }).then(data => {
    document.getElementById('keywordData').value = JSON.stringify(data)
    let temp = ''
    let p = document.createElement('p')
    if (sel == null) p.className = 'select'
    else p.onclick = () => getList()
    p.innerHTML = '전체 보기'
    keywordDiv.appendChild(p)
    for (const e of data) {
      if (e.keyword != temp) {
        temp = e.keyword
        let p = document.createElement('p')
        if (sel == e.keyword) p.className = 'select'
        else p.onclick = () => getList(e.keyword)
        p.innerHTML = temp
        keywordDiv.appendChild(p)
      }
    }
  }).catch(excResp => {
    console.log(excResp)
  })
}

const getItemList = (keyword) => {

  let url = base_url+"/api/v1/list/item/"

  const itemListDiv = document.getElementById('itemList')
  itemListDiv.innerHTML = ''

  url = (keyword == undefined)? url : url+keyword  

  fetch(url, {
    method: 'get'
  }).then(resp => {
    const respJson = resp.json()
    return respJson
  }).then(data => {
    for (const item of data) {
      let itemDiv = document.createElement('div')
      itemDiv.className = 'item'

      let oldRank = 
        (item.oldRank == 0 || item.oldRank == item.rank)
        ? '' 
        : (item.oldRank > item.rank)
          ? `(<span style='color: rgb(255, 65, 65)'>▲${item.oldRank - item.rank}</span>) `
          : `(<span style='color: rgb(65, 65, 255)'>▼${item.rank - item.oldRank}</span>) `

      let mallName = 
        (item.mallName == '')
        ? '가격비교'
        : item.mallName

      let date = changeTimeFotmat(item.createdDate)

      itemDiv.innerHTML = /*html*/`
      <img src='${item.imageUrl}' class="img">
      <div class='info'>
        <div class='productTitle'>
          <a href="${item.crUrl}" target="_blank">${item.productTitle}</a>
        </div>
        <div class="score">
          <span class="rankWrap">
            <label for='rank'>Rank : </label> 
            <span class='rank'>${item.rank}</span>
            <span class='oldRank'>${oldRank}</span>
            <label for='keyword'>Keyword : </label> 
            <span class='keyword'><a href="${search_url+item.keyword}" target="_blank">${item.keyword}</a></span>
          </span> 
        </div>
        <button class="badge bg-light text-dark" onclick="showDetail(${item.initID})">상세보기</button>
      </div>
      <div class='info2'>
        <div class='mall'>${mallName}</div>
        <div class='date'>${date}</div>
        <input type="hidden" id="item-${item.initID}" value='${JSON.stringify(item)}'>
      </div>
      <div class="clear"></div>
      `
      itemListDiv.appendChild(itemDiv)
    }
  }).catch(excResp => {
    console.log(excResp)
  })
}

const changeTimeFotmat = time => {
  let now = new Date(Date.now() - new Date().getTimezoneOffset()*60000).toISOString().split('T')
  time = time.split('T')
  
  if (time[0] == now[0]) {
    nowTemp = now[1].split(':')
    timeTemp = time[1].split(':')

    if (nowTemp[0] == timeTemp[0]) {
      return nowTemp[1] - timeTemp[1] + '분 전'
    }
    return nowTemp[0] - timeTemp[0] + '시간 전'
  } 
  
  return time[0]
}

const blackPage = document.getElementById('blackPage')
const itemDetail = document.getElementById('itemDetail')
const detailCloseBtn = document.getElementById('detailCloseBtn')
const keywordSetDiv = document.getElementById('keywordSetting')

const showKeywordSetting = () => {
  blackPage.style.display = 'block'
  detailCloseBtn.style.display = 'block'
  keywordSetDiv.style.display = 'block'
  blackPage.onclick = () => closeKeywordSetting()
  detailCloseBtn.onclick = () => closeKeywordSetting()

  const json = JSON.parse(document.getElementById('keywordData').value)
  console.log(json)
  
  const mainDiv = document.getElementById('keywordList')
  let tempKey, tempDiv

  for (const e of json) {
    let keywordDiv
    if (tempKey != e.keyword) {
      keywordDiv = document.createElement('div')
      let keywordNameDiv = document.createElement('div')
      keywordNameDiv.innerHTML = e.keyword
      tempKey = e.keyword
      tempDiv = keywordDiv
    } else {
      keywordDiv = tempDiv
    }

    let filterDiv = document.createElement('div')
    
  }

}

const closeKeywordSetting = () => {
  blackPage.style.display = 'none'
  detailCloseBtn.style.display = 'none'
  keywordSetDiv.style.display = 'none'
}

const showDetail = initID => {
  blackPage.style.display = 'block'
  itemDetail.style.display = 'block'
  detailCloseBtn.style.display = 'block'
  blackPage.onclick = () => closeDetail()
  detailCloseBtn.onclick = () => closeDetail()
  const dataDiv1 = document.getElementById('detailData1')
  const dataDiv2 = document.getElementById('detailData2')
  const item = JSON.parse(document.getElementById('item-' + initID).value)
  getChartData(item.id, item.keyword)
  let oldRank = 
        (item.oldRank == 0 || item.oldRank == item.rank)
        ? '' 
        : (item.oldRank > item.rank)
          ? `(<span style='color: rgb(255, 65, 65)'>▲${item.oldRank - item.rank}</span>) `
          : `(<span style='color: rgb(65, 65, 255)'>▼${item.rank - item.oldRank}</span>) `

  dataDiv1.innerHTML = /*html*/`
  <img src='${item.imageUrl}' class="img">
  <div class="info1">
    <div class="link">
    <span class='productPage'>
      <a href="${item.crUrl}" target="_blank">상품 페이지</a>
    </span>
    <span class='searchPage'>
      <a href="${search_url+item.keyword+search_page+Math.ceil(item.rank/40)}" target="_blank">검색 페이지</a>
    </span>
    <span class='searchPage'>
      <a href="${best100_url}${(item.category4Id == '')?(item.category3Id == '')?(item.category2Id == '')?item.category1Id:item.category2Id:item.category3Id:item.category4Id}" target="_blank">Best 100</a>
    </span>
    </div> 
    <div class="title">
      <label>상품 명</label>
      <span>${item.productTitle}</span>
    </div> 
    <div class="category">
      <label>카테고리</label>
      ${(item.category1Id == '')? '' : `<span>${item.category1Name}</span>`}
      ${(item.category2Id == '')? '' : `<span> \> ${item.category2Name}</span>`}
      ${(item.category3Id == '')? '' : `<span> \> ${item.category3Name}</span>`}
      ${(item.category4Id == '')? '' : `<span> \> ${item.category4Name}</span>`}
    </div>
    <div class="lowPrice">
      <label>최저가</label>
      <span>${item.lowPrice.toLocaleString()} 원</span>
    </div>
    <div class="lowPrice">
      <label>속성</label>
      <span>${(item.characterValue == '')? '속성 미입력' : item.characterValue.replace(/\|/gi,' | ')}</span>
    </div>
    <div class="keyword">
      <label>검색어 / 순위</label>
      <span>${item.keyword}</span> / 
      <span>${item.rank}</span>
      <span>${oldRank}</span>
    </div>
    ${
      (item.scoreInfo != null)
      ?/*html*/`
      <div class="keyword">
        <label>랭킹 스코어</label>
        <span>${item.scoreInfo}</span>
      </div>`
      :''
    }
    <div class="date">
      <label>업데이트 날짜</label>
      <span>${item.createdDate.replace(/T/gi,' ')}</span>
    </div>
  </div>
  <div class="clear"></div>
  `
  // dataDiv2.innerHTML = JSON.stringify(item)
}

const closeDetail = () => {
  blackPage.style.display = 'none'
  itemDetail.style.display = 'none'
  detailCloseBtn.style.display = 'none'
  itemDetail.innerHTML = /*html*/`
  <div id="detailData1"></div>
  <div class="chartView">
    <canvas id="itemRankChart"></canvas>
  </div>
  <input type="hidden" id='chartData'>
  <div id="detailData2"></div>
  `
}

const getChartData = (id, keyword) => {
  const url = `${base_url}/api/v1/list/item/rank/${id}/${keyword}`
  const dataInput = document.getElementById('chartData')
  fetch(url, {
    method: 'get'
  }).then(resp => {
    const respJson = resp.json()
    return respJson
  }).then(data => {
    let dateTemp = ''
    let result = []
    for (const e of data) {
      let date = changeTimeFotmat(e.date)
      if (dateTemp != date) {
        dateTemp = date
        result.push({rank : e.rank, date})
      }
    }
    dataInput.value = JSON.stringify(result)
    createRankChart(result, 'all')
  }).catch(excResp => {
    console.log(excResp)
  })
}

const createRankChart = (json, DATA_COUNT) => {
  DATA_COUNT = (DATA_COUNT == 'all' || DATA_COUNT > json.length)? json.length : DATA_COUNT;
  const labels = []
  const datapoints = []
  for (let i = 0; i < DATA_COUNT; i++) {
    const e = json[i];
    labels.push(e.date)
    datapoints.push(e.rank)
  }
  const config = {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '랭킹',
        data: datapoints,
        borderColor: '#1e90ff',
        cubicInterpolationMode: 'monotone',
        tension: 0.4,
        fill : false
      }]
    },
    options: {
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            reverse: true,
            min: 1,
            stepSize: 5
          },
          display: true
        }],
        xAxes: [{
          ticks: {
            reverse: true,
          }
        }]
      },
      legend: {
        display: false
      }
    }
  }

  let chart = new Chart(document.getElementById('itemRankChart'),config)
  
}
