# slideshot

[네이버 오피스][1] 슬라이드 편집기에서 현재 사용자가 보고있는 슬라이드를
[HTML5 canvas element][2]에 렌더링해주는 유틸리티입니다.

[1]: http://office.naver.com/
[2]: http://www.w3.org/TR/html5/scripting-1.html#the-canvas-element


## 사용법

1. 크롬 브라우저에서 네이버 오피스 슬라이드 문서를 엽니다.
2. 자바스크립트 콘솔을 열고 `slideshot.js`의 내용을 복사 및 붙여넣기 후 실행합니다.
3. 브라우저 화면에 캡쳐된 슬라이드 이미지가 뜹니다.
    * 드래그해서 편집 영역의 내용과 비교해볼 수 있습니다.
    * 자바스크립트 콘솔에 [이미지의 URL][data URI]이 출력됩니다. 클릭해서 저장할 수 있습니다.

[data URI]: https://developer.mozilla.org/en-US/docs/Web/HTTP/data_URIs
