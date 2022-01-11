export const wxml = `
    <view class="container" >
      <text class="headTitle">外教带你背单词堂</text>
      <text class="headText">“今天又收获了好多知识，快来一起学习吧”</text>
      <view class="chartBox">
        <view class="img"></view>
        <view class="emptyBox"></view>
        <text class="footerTitle">点评</text>
        <text class="footerText">
          恭喜完成了本次练习的所有任务! 你已经坚持上课
        </text>
        <view class="textBox">
          <text class="colorText">30分钟, 答对5题</text>
          <text class="rightText">，期待下次更出色的表现！</text>
        </view>
      </view>
    </view>`;
export const style = {
  container: {
    width: 270,
    height: 325,
    flexDirection: 'column',
    backgroundColor: '#0082fe',
    borderRadius: 4,
    color: '#fff',
    padding: 10
  },
  headTitle: {
    width: 250,
    fontSize: 16,
    height: 30,
    verticalAlign: 'bottom'
  },
  headText: {
    width: 250,
    height: 25,
    marginTop: 5,
    fontSize: 12
  },
  chartBox: {
    width: 250,
    height: 240,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 4
  },
  img: {
    width: 220,
    height: 149
  },
  emptyBox: {
    width: 230,
    height: 1,
    backgroundColor: '#eee'
  },
  footerTitle: {
    width: 250,
    height: 40,
    fontSize: 14,
    color: '#000',
    verticalAlign: 'middle'
  },
  footerText: {
    width: 220,
    height: 15,
    fontSize: 10,
    flexWrap: 'wrap',
    color: '#666'
  },
  textBox: {
    width: 220,
    height: 25,
    flexDirection: 'row'
  },
  colorText: {
    width: 75,
    height: 20,
    fontSize: 10,
    color: '#0082fe'
  },
  rightText: {
    width: 120,
    height: 20,
    fontSize: 10,
    color: '#666'
  }
};
