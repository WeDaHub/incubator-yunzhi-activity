import { wxml, style } from './html';
Component({
  data: {
    imageSrc: '',
    width: 0,
    height: 0,
    show: false
  },
  lifetimes: {
    ready() {
      this.widget = this.selectComponent('.widget');
    },
    detached() {
      this.widget = null;
    }
  },
  methods: {
    toMoments(e) {
      if (!this.data.imageSrc) this.renderToCanvas();
      this.setData({ show: true });
    },
    renderToCanvas() {
      const p1 = this.widget.renderToCanvas({ wxml, style });
      p1.then((res) => {
        this.container = res;
        this.extraImage();
      });
    },
    extraImage() {
      const p2 = this.widget.canvasToTempFilePath();
      p2.then((res) => {
        this.setData({
          imageSrc: res.tempFilePath,
          width: this.container.layoutBox.width,
          height: this.container.layoutBox.height
        });
      });
    },
    onClose() {
      this.setData({ show: false });
    },
    onSave() {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.imageSrc,
        success: (res) => {
          wx.showModal({
            title: '图片已保存到系统相册',
            content: '快去分享到朋友圈吧',
            confirmText: '我知道了',
            showCancel: false,
            success: (res) => {
              this.setData({ show: false });
            }
          });
        },
        fail(err) {
          let errMsg = '请授权保存到相册(右上角-设置)';
          wx.showToast({ mask: true, title: errMsg, icon: 'none', duration: 5000 });
        }
      });
    }
  }
});
