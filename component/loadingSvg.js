const max = '50';
export function getLoading(size,color) {
  size = (size < 14 || !size) ? 14 : size;
  color = color || '#fff';
  if(size > max){
    size = max;
  }
  return `
    <svg data-type="loading"
        width="${size}"
        height="${size}"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid"
        class="lds-dual-ring"
        style="background: none;">
        <circle cx="50" cy="50"
                fill="none"
                stroke-linecap="round" r="40"
                stroke-width="4" stroke="${color}"
                stroke-dasharray="62.83185307179586 62.83185307179586"
                transform="rotate(161.374 50 50)" class="">
          <animateTransform
            attributeName="transform"
            type="rotate"
            calcMode="linear"
            values="0 50 50;360 50 50"
            keyTimes="0;1" dur="1s"
            begin="0s" repeatCount="indefinite"
            class="">

          </animateTransform>
        </circle>
      </svg>
  `
}
