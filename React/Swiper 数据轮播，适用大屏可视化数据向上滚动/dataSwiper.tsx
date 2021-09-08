import React, { FC, ReactNode, useState, useEffect, memo } from 'react';
import { Swiper } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import 'swiper/swiper.less';

// install Swiper modules
SwiperCore.use([Autoplay]);

interface PropsType extends Swiper {
  children: ReactNode;
}

/**
 * 翻页轮播组件，适用于大屏可视化数据定时向上滚动等
 * 若出现滚动异常，可尝试设置 height
 * More: https://github.com/zhchjiang95/component-or-tools
 * @param children SwiperSlide[] 组件，参见：https://swiperjs.com/react
 * @param restProps 更多参见：https://www.swiper.com.cn/api
 * @returns React.FunctionComponent
 */
const DataSwiper: FC<PropsType> = ({ children, autoplay, ...restProps }) => {
  // Swiper 实例
  const [swiper, setSwiper] = useState<SwiperCore>();

  useEffect(() => {
    if (!swiper) {
      return;
    }
    const sw = swiper?.$el[0] as HTMLElement;
    sw.onmouseover = () => {
      if (autoplay === false) return;
      swiper?.autoplay.stop();
    };
    sw.onmouseout = () => {
      if (autoplay === false) return;
      swiper?.autoplay.start();
    };
    return () => {
      sw.onmouseover = null;
      sw.onmouseout = null;
    };
  }, [swiper]);

  let atp: Record<string, unknown> | boolean = {
    delay: 5000,
    disableOnInteraction: false,
  };
  // 如果为 true，使用默认配置，否则合并配置
  if (typeof autoplay === 'boolean') {
    atp = autoplay ? atp : false;
  } else {
    atp = { ...atp, ...autoplay };
  }

  return (
    <Swiper
      loop
      speed={600}
      autoplay={atp}
      direction="vertical"
      // 当Swiper的父元素变化时，例如window.resize，Swiper更新
      // observer
      // observeParents
      // 获取当前实例
      onSwiper={(sw) => setSwiper(sw)}
      // 禁止鼠标滑动
      className={autoplay === false ? 'swiper-no-swiping' : ''}
      {...restProps}
    >
      {children}
    </Swiper>
  );
};

export default memo(DataSwiper);
