# 傅立叶实验室 · Fourier Lab

一套用图像和语音学傅立叶变换的中文交互教程。从十八世纪的琴弦之争出发，跟着傅立叶研究热传导，再看狄利克雷怎样说明级数的收敛。动手用正弦曲线拼出铁棒的温度，再把同一种分解思路用到图像和语音上。

**[打开在线教程](https://mengman.github.io/fourier-lab/)**

## 可以做什么

| 实验 | 怎么玩 |
| --- | --- |
| **热传导** | 调整正弦级数的项数和冷却时间，观察台阶状温度如何重建，以及高频为什么衰减得更快。 |
| **频率探针** | 用滑块扫过由 3 Hz 和 7 Hz 叠加的波形。比较不同探针频率的读数，再转动相位，看看两个投影怎么变、幅度为什么保持不变。 |
| **图像处理** | 对 128 × 128 的灰度图做二维 FFT，在低通、高通、陷波和完整重建之间切换。并排看原图、频谱和逆变换结果。 |
| **语音处理** | 听普通话示例，比较加入 1 kHz 啸声前后和陷波后的语谱图。拖动分析窗长或观察时刻，也可以选择本地音频，浏览器内分析前 8 秒。 |
| **JavaScript 练习** | 补完频点幅度、图像低通掩膜和语音陷波三个小函数。每题约 1–2 行，网页内可以运行测试，也能展开提示和参考答案。 |

## 本地运行

项目使用原生 HTML、CSS 和 JavaScript，无需安装前端依赖或执行构建。在仓库根目录启动静态服务器。

```bash
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

打开 [本地教程](http://127.0.0.1:8000/)。

## 文件与部署

- [`dist/index.html`](dist/index.html) 存放教程文字和实验界面。
- [`dist/lab.js`](dist/lab.js) 实现 DFT、FFT、图像滤波、语谱图和代码练习。
- [`dist/style.css`](dist/style.css) 定义页面样式和响应式布局。
- [`dist/speech.wav`](dist/speech.wav) 是内置的普通话合成语音样本。

推送到 `main` 时，[GitHub Actions 工作流](.github/workflows/pages.yml) 会把 `dist/` 发布到 GitHub Pages。

## 延伸阅读

- [3Blue1Brown · 用旋转理解傅立叶变换](https://www.3blue1brown.com/lessons/fourier-transforms/)
- [OpenCV · 图像的二维傅立叶变换](https://docs.opencv.org/4.x/de/dbc/tutorial_py_fourier_transform.html)
- [Audacity · 怎样读语谱图](https://manual.audacityteam.org/man/spectrogram_view.html)
