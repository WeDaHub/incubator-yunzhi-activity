Component({
  properties: {
    tabs: {
      type: Array,
      value: [],
      observer(tabs) {
        // const { }
      }
    },
    labelProp: String,
    labelNum: String,
    width: {
      type: String,
      value: 'unset'
    },
    activeTab: {
      type: Number,
      value: -1,
      observer(activeTab) {
        const { tabs } = this.properties;
        if (activeTab >= 0 && tabs.length > 0 && activeTab < tabs.length) {
          this.line2tab(activeTab);
        }
      }
    },
    extClass: {
      type: String,
      value: ''
    }
  },
  data: {
    lineWidth: '0rpx',
    lineLeft: '0rpx',
    scrollLeft: 0
  },
  lifetimes: {
    attached: function () {
      const { activeTab, tabs } = this.properties;
      if (activeTab >= 0 && tabs.length > 0 && activeTab < tabs.length) {
        this.line2tab(activeTab);
      }
    }
  },
  methods: {
    handleLink(e) {
      const item = e.currentTarget.dataset.item;
      const index = e.currentTarget.dataset.index;

      if (!item) return;

      this.setData({
        activeTab: index
      });

      this.line2tab(index);

      this.triggerEvent('select', { item, index });
    },
    getBoundingClientRect(className) {
      return new Promise((resolve) => {
        const query = this.createSelectorQuery().in(this);
        const selector = query.select(className);

        if (!selector) {
          resolve(null);
          return;
        }

        selector
          .boundingClientRect((rect) => {
            resolve(rect);
          })
          .exec();
      });
    },
    async line2tab(idx) {
      const tabRect = await this.getBoundingClientRect(`.tabs-cont .tab-${idx}`);
      const tabsRect = await this.getBoundingClientRect('.tabs-cont');

      this.setData({
        lineWidth: `${tabRect.width / 4}px`,
        lineLeft: `${tabRect.left - tabsRect.left + (tabRect.width * 3) / 8}px`
      });
    }
  }
});
